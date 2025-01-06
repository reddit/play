import {type PropertyValues, ReactiveElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {WebAccess, WebStorage} from '@zenfs/dom'
import * as ZenFS from '@zenfs/core'
import {type FileSystem, fs, InMemory} from '@zenfs/core'
import * as IDB from 'idb-keyval'
import {
  hasFileAccessAPI,
  tryGetFile,
  tryQueryPermission
} from '../../utils/file-access-api.js'
import {Zip} from '@zenfs/archives'
import {Bubble} from '../../utils/bubble.js'

declare global {
  interface HTMLElementEventMap {
    'assets-updated': CustomEvent<AssetsState>
  }
  interface HTMLElementTagNameMap {
    'play-assets': PlayAssets
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

//region Custom types
export type AssetsFilesystemType = 'virtual' | 'local'

type AssetsFilesystemTypeChange = {
  kind: 'filesystem-type'
  filesystemType: AssetsFilesystemType
}

type AssetsFilesystemMountArchiveChange = {
  kind: 'mount-archive'
  archiveHandle: FileSystemFileHandle | File
}

type AssetsFilesystemMountDirectoryChange = {
  kind: 'mount-directory'
  directoryHandle: FileSystemDirectoryHandle
}

type AssetsFilesystemRemountArchiveChange = {
  kind: 'remount-archive'
}

type AssetsFilesystemUnmountChange = {
  kind: 'unmount'
}

export type AssetsFilesystemChange =
  | AssetsFilesystemTypeChange
  | AssetsFilesystemMountArchiveChange
  | AssetsFilesystemMountDirectoryChange
  | AssetsFilesystemRemountArchiveChange
  | AssetsFilesystemUnmountChange

type AssetsVirtualFileAddChange = {
  kind: 'add'
  fileHandle: FileSystemFileHandle | File
}

type AssetsVirtualFileRemoveChange = {
  kind: 'remove'
  name: string
}

type AssetsVirtualFileRenameChange = {
  kind: 'rename'
  oldName: string
  newName: string
}

type AssetsVirtualFileClearChange = {
  kind: 'clear'
}

export type AssetsVirtualFileChange =
  | AssetsVirtualFileAddChange
  | AssetsVirtualFileRemoveChange
  | AssetsVirtualFileRenameChange
  | AssetsVirtualFileClearChange

export type AssetsState = {
  readonly hasFileAccessAPI: boolean
  readonly filesystemType: AssetsFilesystemType

  readonly archiveFilename?: string | undefined
  readonly directoryName?: string | undefined

  readonly map: {readonly [path: string]: string}
  readonly count: number
}

type LocalFileHandles = {
  directory?: FileSystemDirectoryHandle | undefined
  archive?: FileSystemFileHandle | undefined
}
//endregion

export function emptyAssetsState(): AssetsState {
  return {
    hasFileAccessAPI,
    filesystemType: 'virtual',
    map: {},
    count: 0
  }
}

@customElement('play-assets')
export class PlayAssets extends ReactiveElement {
  //region Properties
  @property({attribute: 'allow-storage', type: Boolean})
  allowStorage: boolean = false

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  @property({attribute: 'filesystem-type', type: String, reflect: true})
  filesystemType: AssetsFilesystemType = 'virtual'
  //endregion

  //region Private fields
  #localFileHandles: LocalFileHandles = {}
  //endregion

  //region ReactiveElement overrides
  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('filesystemType')) {
      void this.#mountAssets()
    }
  }

  //endregion

  //region Event handlers
  async onFilesystemChange(change: AssetsFilesystemChange): Promise<void> {
    switch (change.kind) {
      case 'filesystem-type':
        this.filesystemType = change.filesystemType
        await this.#mountAssets()
        break
      case 'remount-archive':
        await this.#remount()
        break
      case 'mount-archive':
        await this.#mountLocalArchive(change.archiveHandle)
        break
      case 'mount-directory':
        await this.#mountLocalDirectory(change.directoryHandle)
        break
      case 'unmount':
        await this.#unmount()
        break
    }
  }

  async onVirtualFileChange(change: AssetsVirtualFileChange): Promise<void> {
    if (this.filesystemType !== 'virtual') {
      return
    }
    switch (change.kind) {
      case 'add':
        await this.#addVirtualFile(change.fileHandle)
        break
      case 'rename':
        await this.#renameVirtualFile(change.oldName, change.newName)
        break
      case 'remove':
        await this.#removeVirtualFile(change.name)
        break
      case 'clear':
        await this.#clearVirtualFiles()
        break
      default:
        return
    }
    await this.#updateMap()
  }
  //endregion

  //region Mount management
  async #mountAssets(): Promise<void> {
    this.#unmountRoot()
    if (this.filesystemType === 'virtual') {
      await this.#mountVirtualFS()
    } else {
      await this.#tryMountCachedLocalFS()
    }
  }

  async #remount(): Promise<void> {
    if (this.#localFileHandles.archive) {
      await this.#mountLocalArchive(this.#localFileHandles.archive)
    }
  }

  async #unmount(): Promise<void> {
    this.#unmountRoot()
    await this.#updateMap()
    await this.#cacheUpdate({})
  }

  async #mountLocalArchive(
    fileHandle: FileSystemFileHandle | File
  ): Promise<void> {
    let file
    if ('getFile' in fileHandle) {
      file = await fileHandle.getFile()
      await this.#cacheUpdate({archive: fileHandle})
    } else {
      file = fileHandle as File
      await this.#cacheClear()
    }
    await this.#mountRoot(Zip.create({data: await file.arrayBuffer()}))
    this.#updateState({archiveFilename: fileHandle.name})
  }

  async #mountLocalDirectory(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    await this.#mountRoot(WebAccess.create({handle: directoryHandle}))
    await this.#cacheUpdate({directory: directoryHandle})
    this.#updateState({directoryName: directoryHandle.name})
  }

  async #mountRoot(fs: FileSystem): Promise<void> {
    this.#unmountRoot()
    ZenFS.mount('/', fs)
    await this.#updateMap()
  }

  #unmountRoot(): void {
    if (ZenFS.mounts.has('/')) {
      ZenFS.umount('/')
      this.#updateState({
        archiveFilename: undefined,
        directoryName: undefined,
        map: {},
        count: 0
      })
    }
  }

  async #mountVirtualFS(): Promise<void> {
    if (this.allowStorage) {
      const fs = WebStorage.create({})
      // dump old localStorage content if it can't be read
      try {
        await fs.stat('/')
      } catch (e) {
        await fs.empty()
      }
      await this.#mountRoot(fs)
    } else {
      await this.#mountRoot(InMemory.create({}))
    }
  }

  async #tryMountCachedLocalFS(): Promise<void> {
    const [directory, archive] = await this.#cacheLoadHandles()

    if (directory && (await this.#canReadHandle(directory))) {
      await this.#mountLocalDirectory(directory)
    } else if (archive && (await this.#canReadHandle(archive))) {
      await this.#mountLocalArchive(archive)
    } else {
      await this.#cacheClear()
    }
  }
  //endregion

  //region Virtual filesystem management
  async #addVirtualFile(handle: FileSystemFileHandle | File): Promise<void> {
    const file = await tryGetFile(handle)
    await fs.promises.writeFile(
      file.name,
      new Uint8Array(await file.arrayBuffer()),
      {flush: true}
    )

    await this.#updateMap()
  }

  async #renameVirtualFile(oldName: string, newName: string): Promise<void> {
    await fs.promises.rename(oldName, newName)

    await this.#updateMap()
  }

  async #removeVirtualFile(name: string): Promise<void> {
    await fs.promises.unlink(name)

    await this.#updateMap()
  }

  async #clearVirtualFiles(): Promise<void> {
    await Promise.all(
      Object.keys(this.assetsState.map ?? {}).map(name =>
        fs.promises.unlink(name)
      )
    )
  }
  //endregion

  //region IndexedDB cache
  async #cacheLoadHandles(): Promise<
    [FileSystemDirectoryHandle | undefined, FileSystemFileHandle | undefined]
  > {
    const [dir, zip] = await IDB.getMany([CACHE_LAST_DIR, CACHE_LAST_ZIP])
    return [dir, zip]
  }

  async #cacheUpdate(handles: LocalFileHandles): Promise<void> {
    this.#localFileHandles = handles
    await IDB.setMany([
      [CACHE_LAST_DIR, handles.directory],
      [CACHE_LAST_ZIP, handles.archive]
    ])
  }

  async #cacheClear(): Promise<void> {
    await IDB.delMany([CACHE_LAST_DIR, CACHE_LAST_ZIP])
  }

  async #canReadHandle(handle: FileSystemHandle): Promise<boolean> {
    return (await tryQueryPermission(handle, {mode: 'read'})) === 'granted'
  }
  //endregion

  //region State
  async #updateMap(): Promise<void> {
    this.#clearAssetMap()
    const assetMap: {[path: string]: string} = {}
    let assetCount = 0
    if (ZenFS.mounts.has('/')) {
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
          assetMap[name] = window.URL.createObjectURL(
            new Blob([buffer], {type: mimetype})
          )
          assetCount++
        }
      }
    }

    this.#updateState({map: assetMap, count: assetCount})
  }

  #clearAssetMap() {
    const assetMap = this.assetsState.map ?? {}
    for (const entry of Object.keys(assetMap)) {
      const url = assetMap[entry] ?? undefined
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }

  #updateState(updates: Partial<AssetsState>): void {
    const newState = {
      ...this.assetsState,
      ...updates,
      filesystemType: this.filesystemType
    }

    this.dispatchEvent(Bubble<AssetsState>('assets-updated', newState))
  }
  //endregion
}
