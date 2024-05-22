import {WebAccess, WebStorage} from '@zenfs/dom'
import {Bubble} from '../../utils/bubble.js'
import {Zip} from '@zenfs/zip'
import {
  hasFileAccessAPI,
  tryGetFile,
  tryQueryPermission
} from '../../utils/file-access-api.js'
import * as ZenFS from '@zenfs/core'
import {FileSystem, fs, InMemory} from '@zenfs/core'
import type {AssetMap} from '@devvit/shared-types/Assets.js'
import * as IDB from 'idb-keyval'
import {createContext} from '@lit/context'

declare global {
  interface HTMLElementEventMap {
    'assets-set-filesystem': CustomEvent<AssetFilesystemType>
    'assets-updated': CustomEvent<void>
  }
}

const CACHE_LAST_DIR = 'lastMountedDirectory'
const CACHE_LAST_ZIP = 'lastMountedArchive'

const MIME: {readonly [ext: string]: string} = {
  html: 'text/html',
  htm: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif'
}
const DEFAULT_MIME = 'application/octet-stream'

export type AssetFilesystemType = 'virtual' | 'local'

export const assetsContext = createContext<PlayAssets>('play-assets')

export class PlayAssets extends EventTarget {
  #filesystemType: AssetFilesystemType = 'virtual'
  #allowStorage: boolean = false
  #assetMap: AssetMap = {}
  #assetCount: number = 0
  #archiveHandle: FileSystemFileHandle | File | undefined
  #directoryHandle: FileSystemDirectoryHandle | undefined

  #waitForMount: Promise<void> = new Promise(
    resolve => (this._mountReady = resolve)
  )
  private _mountReady!: () => void

  static get hasFileAccessAPI(): boolean {
    return hasFileAccessAPI
  }

  async getAssetMap(): Promise<AssetMap> {
    if (this.#directoryHandle) {
      await this.#waitForMount
      await this.#updateMap(false)
    }

    return this.#assetMap
  }

  get filesystemType(): AssetFilesystemType {
    return this.#filesystemType
  }

  set allowStorage(value: boolean) {
    const oldValue = this.#allowStorage
    this.#allowStorage = value
    if (oldValue !== value && this.filesystemType === 'virtual') {
      void this.initialize(this.filesystemType)
    }
  }

  get allowStorage(): boolean {
    return this.#allowStorage
  }

  get assetCount(): number {
    return this.#assetCount
  }

  get isArchiveMounted(): boolean {
    return !!this.#archiveHandle
  }

  get archiveFilename(): string | undefined {
    return this.#archiveHandle?.name
  }

  get isDirectoryMounted(): boolean {
    return !!this.#directoryHandle
  }

  get directoryName(): string | undefined {
    return this.#directoryHandle?.name
  }

  //region Mount APIs
  async mountVirtualFs(): Promise<void> {
    if (this.allowStorage) {
      await this.#mountRoot(WebStorage.create({}))
    } else {
      await this.#mountRoot(InMemory.create({}))
    }
    this.#emitAssetsUpdated()
  }

  async mountLocalDirectory(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    await this.#mountRoot(WebAccess.create({handle: directoryHandle}))
    await this.#updateCache({directory: directoryHandle})
    this.#directoryHandle = directoryHandle
    this.#archiveHandle = undefined
    this.#emitAssetsUpdated()
    this._mountReady()
  }

  async mountLocalArchive(
    fileHandle: FileSystemFileHandle | File
  ): Promise<void> {
    let file
    if ('getFile' in fileHandle) {
      file = await fileHandle.getFile()
      await this.#updateCache({archive: fileHandle})
    } else {
      file = fileHandle as File
      await this.#clearCache()
    }
    await this.#mountRoot(Zip.create({zipData: await file.arrayBuffer()}))
    this.#archiveHandle = fileHandle
    this.#directoryHandle = undefined
    this.#emitAssetsUpdated()
    this._mountReady()
  }

  async remountLocalArchive(): Promise<void> {
    if (this.#archiveHandle) {
      await this.mountLocalArchive(this.#archiveHandle)
    }
  }

  async unmount(): Promise<void> {
    this.#unmountRoot()
    await this.#updateMap()
    await this.#updateCache({})
    this.#emitAssetsUpdated()
  }
  //endregion

  //region Virtual FS
  async addVirtualAsset(handle: FileSystemFileHandle | File): Promise<void> {
    const file = await tryGetFile(handle)
    await fs.promises.writeFile(
      file.name,
      new Uint8Array(await file.arrayBuffer()),
      {flush: true}
    )

    await this.#updateMap()
  }

  async renameVirtualAsset(oldName: string, newName: string): Promise<void> {
    if (this.#filesystemType !== 'virtual') {
      return
    }

    await fs.promises.rename(oldName, newName)

    await this.#updateMap()
  }

  async deleteVirtualAsset(name: string): Promise<void> {
    if (this.#filesystemType !== 'virtual') {
      return
    }

    await fs.promises.unlink(name)

    await this.#updateMap()
  }

  async clearVirtualAssets(): Promise<void> {
    if (this.#filesystemType !== 'virtual' || !this.#assetMap) {
      return
    }

    const removals = []
    for (const name of Object.keys(this.#assetMap)) {
      removals.push(fs.promises.unlink(name))
    }
    await Promise.all(removals)

    await this.#updateMap()
  }
  //endregion

  //region Internal FS management
  async initialize(filesystemType: AssetFilesystemType): Promise<void> {
    this.#filesystemType = filesystemType || 'virtual'
    this.#unmountRoot()
    if (filesystemType === 'virtual') {
      await this.mountVirtualFs()
    } else {
      const [directory, archive] = await this.#loadFromCache()

      if (directory) {
        if (await this.#verifyPermissions(directory)) {
          await this.mountLocalDirectory(directory)
        } else {
          await this.#clearCache()
        }
      } else if (archive) {
        if (await this.#verifyPermissions(archive)) {
          await this.mountLocalArchive(archive)
        } else {
          await this.#clearCache()
        }
      }
    }
  }

  async #mountRoot(fs: FileSystem): Promise<void> {
    this.#unmountRoot()
    ZenFS.mount('/', fs)
    await this.#updateMap(false)
  }

  #unmountRoot(): void {
    if (ZenFS.mounts.has('/')) {
      ZenFS.umount('/')
      this.#archiveHandle = undefined
      this.#directoryHandle = undefined
      this.#assetMap = {}
      this.#assetCount = 0
      this.#waitForMount = new Promise<void>(
        resolve => (this._mountReady = resolve)
      )
    }
  }
  //endregion

  //region Internal FileSystemHandle caching
  async #loadFromCache(): Promise<
    [FileSystemDirectoryHandle | undefined, FileSystemFileHandle | undefined]
  > {
    const [dir, zip] = await IDB.getMany([CACHE_LAST_DIR, CACHE_LAST_ZIP])
    return [dir, zip]
  }

  async #updateCache(handles: {
    directory?: FileSystemDirectoryHandle | undefined
    archive?: FileSystemFileHandle | undefined
  }): Promise<void> {
    await IDB.setMany([
      [CACHE_LAST_DIR, handles.directory],
      [CACHE_LAST_ZIP, handles.archive]
    ])
  }

  async #clearCache(): Promise<void> {
    await IDB.delMany([CACHE_LAST_DIR, CACHE_LAST_ZIP])
  }

  async #verifyPermissions(handle: FileSystemHandle): Promise<boolean> {
    return (await tryQueryPermission(handle, {mode: 'read'})) === 'granted'
  }
  //endregion

  //region Internal AssetMap caching
  async #updateMap(emitEvent: boolean = true): Promise<void> {
    this.#clearAssetMap()
    if (!ZenFS.mounts.has('/')) {
      return
    }
    const entries: string[] = []
    entries.push(...(await fs.promises.readdir('/')))
    while (entries.length > 0) {
      const entry = entries.shift()!
      // remove the leading / present in some backends
      const name = entry.replace(/^\//, '')
      const stat = await fs.promises.stat(entry)
      if (stat.isDirectory()) {
        entries.unshift(
          ...(await fs.promises.readdir(entry)).map(child => {
            if (child.startsWith('/')) return child
            return `${entry}/${child}`
          })
        )
      } else {
        const file = await fs.promises.open(entry)
        const buffer = await file.readFile()
        await file.close()
        const basename = entry.split('/').at(-1)!
        const extension = basename.split('.').at(-1)!
        const mimetype = MIME[extension] ?? DEFAULT_MIME
        this.#assetMap![name] = window.URL.createObjectURL(
          new Blob([buffer], {type: mimetype})
        )
        this.#assetCount++
      }
    }
    if (emitEvent) {
      this.#emitAssetsUpdated()
    }
  }

  #clearAssetMap(): void {
    const assetMap = this.#assetMap!
    for (const entry of Object.keys(assetMap)) {
      const url = assetMap[entry] ?? undefined
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
    this.#assetMap = {}
    this.#assetCount = 0
  }
  //endregion

  #emitAssetsUpdated(): void {
    this.dispatchEvent(Bubble<void>('assets-updated', undefined))
  }
}
