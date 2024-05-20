import {type PropertyValues, ReactiveElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {PlayPen} from '../play-pen/play-pen.js'
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

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets': PlayAssets
  }
}

export type AssetFilesystemType = 'virtual' | 'local'

const CACHE_LAST_DIR = 'lastMountedDirectory'
const CACHE_LAST_ZIP = 'lastMountedArchive'

const MIME: {[ext: string]: string} = {
  html: 'text/html',
  htm: 'text/html',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif'
}
const DEFAULT_MIME = 'application/octet-stream'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen': PlayPen
  }
  interface HTMLElementEventMap {
    'assets-updated': CustomEvent<void>
  }
}

@customElement('play-assets')
export class PlayAssets extends ReactiveElement {
  @property({attribute: 'allow-storage', type: Boolean})
  allowStorage: boolean = false

  @property({attribute: 'filesystem-type', reflect: true, type: String})
  filesystemType: AssetFilesystemType = 'virtual'

  @property({attribute: false})
  directoryHandle: FileSystemDirectoryHandle | undefined

  @property({attribute: false})
  directoryName: string | undefined

  @property({attribute: false})
  archiveHandle: FileSystemFileHandle | File | undefined

  @property({attribute: false})
  archiveFilename: string | undefined

  @property({attribute: false})
  assetCount: number = 0

  _rootAssets: PlayAssets | undefined
  #assetMap: AssetMap = {}

  private _waitForInit: Promise<void> = new Promise(
    resolve => (this._initComplete = resolve)
  )
  private _initComplete!: () => void

  static get hasFileAccessAPI(): boolean {
    return hasFileAccessAPI
  }

  get assetMap(): Promise<AssetMap> {
    if (this._rootAssets) {
      return this._rootAssets.assetMap
    }

    const resolvedMap = () => this._waitForInit.then(() => this.#assetMap)
    if (this.directoryHandle) {
      return this.#updateMap(false).then(resolvedMap)
    }
    return resolvedMap()
  }

  override connectedCallback() {
    super.connectedCallback()

    // try and find a play-assets element higher up the DOM to attach to

    this._rootAssets = this.#findRootAssets()
    this._rootAssets?.addEventListener('assets-updated', this.#syncRootAssets)
    this.#syncRootAssets()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    this._rootAssets?.removeEventListener(
      'assets-updated',
      this.#syncRootAssets
    )
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('filesystemType')) {
      if (this._rootAssets) {
        if (
          changedProperties.get('filesystemType') &&
          this._rootAssets.filesystemType !== this.filesystemType
        ) {
          this._rootAssets.filesystemType = this.filesystemType
        }
      } else {
        void this.#initialize(this.filesystemType)
        this.#emitAssetsUpdated()
      }
    }
    if (changedProperties.has('archiveHandle')) {
      if (this.archiveHandle) {
        this.archiveFilename = this.archiveHandle.name
        this.directoryHandle = undefined
        this.directoryName = undefined
      } else {
        this.archiveFilename = undefined
      }
    }
    if (changedProperties.has('directoryHandle')) {
      if (this.directoryHandle) {
        this.archiveHandle = undefined
        this.archiveFilename = undefined
        this.directoryName = this.directoryHandle.name
      } else {
        this.directoryName = undefined
      }
    }
  }

  //region Mount APIs
  mountVirtualFs = async () => this.#callRootAssets(this.#mountVirtualFs)

  async #mountVirtualFs(): Promise<void> {
    if (this.allowStorage) {
      await this.#mountRoot(WebStorage.create({}))
      console.log('Assets will be persisted')
    } else {
      await this.#mountRoot(InMemory.create({}))
      console.log('Assets will not be persisted')
    }
    this.#emitAssetsUpdated()
  }

  mountLocalDirectory = async (directoryHandle: FileSystemDirectoryHandle) =>
    this.#callRootAssets(this.#mountLocalDirectory, directoryHandle)

  async #mountLocalDirectory(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    await this.#mountRoot(WebAccess.create({handle: directoryHandle}))
    await this.#updateCache({directory: directoryHandle})
    this.directoryHandle = directoryHandle
    this.#emitAssetsUpdated()
  }

  mountLocalArchive = async (fileHandle: FileSystemFileHandle | File) =>
    this.#callRootAssets(this.#mountLocalArchive, fileHandle)

  async #mountLocalArchive(
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
    this.archiveHandle = fileHandle
    this.#emitAssetsUpdated()
  }

  remountLocalArchive = async () =>
    this.#callRootAssets(this.#remountLocalArchive)

  async #remountLocalArchive(): Promise<void> {
    if (this.archiveHandle) {
      await this.mountLocalArchive(this.archiveHandle)
    }
  }

  unmount = () => this.#callRootAssets(this.#unmount)

  async #unmount(): Promise<void> {
    this.#unmountRoot()
    await this.#updateMap()
    await this.#updateCache({})
    this.#emitAssetsUpdated()
  }
  //endregion

  //region Virtual FS
  addVirtualAsset = async (handle: FileSystemFileHandle | File) =>
    this.#callRootAssets(this.#addVirtualAsset, handle)

  async #addVirtualAsset(handle: FileSystemFileHandle | File): Promise<void> {
    const file = await tryGetFile(handle)
    await fs.promises.writeFile(
      file.name,
      new Uint8Array(await file.arrayBuffer()),
      {flush: true}
    )

    await this.#updateMap()
  }

  renameVirtualAsset = async (oldName: string, newName: string) =>
    this.#callRootAssets(this.#renameVirtualAsset, oldName, newName)

  async #renameVirtualAsset(oldName: string, newName: string): Promise<void> {
    if (this.filesystemType !== 'virtual') {
      return
    }

    await fs.promises.rename(oldName, newName)

    await this.#updateMap()
  }

  deleteVirtualAsset = async (name: string) =>
    this.#callRootAssets(this.#deleteVirtualAsset, name)

  async #deleteVirtualAsset(name: string): Promise<void> {
    if (this.filesystemType !== 'virtual') {
      return
    }

    await fs.promises.unlink(name)

    await this.#updateMap()
  }

  clearVirtualAssets = async () =>
    this.#callRootAssets(this.#clearVirtualAssets)

  async #clearVirtualAssets(): Promise<void> {
    if (this.filesystemType !== 'virtual' || !this.#assetMap) {
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

  #findRootAssets(): PlayAssets | undefined {
    let currentElement = this.#traverseToParent(this as Element)
    let root: PlayAssets | undefined

    while (currentElement) {
      const assets =
        currentElement.querySelector('play-assets') ??
        currentElement.shadowRoot?.querySelector('play-assets')
      if (assets && assets !== this) {
        root = assets as PlayAssets
      }
      currentElement = this.#traverseToParent(currentElement)
    }

    return root
  }

  #traverseToParent(el: Element): Element | undefined {
    if (el.parentElement) {
      return el.parentElement
    }
    if (el.parentNode && 'host' in el.parentNode) {
      return (el.parentNode as ShadowRoot).host
    }
  }

  async #initialize(filesystemType: AssetFilesystemType): Promise<void> {
    this.filesystemType = filesystemType || 'virtual'
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
    this._initComplete()
  }

  #callRootAssets<R, T extends (...args: any[]) => R>(
    method: T,
    ...args: unknown[]
  ): R {
    return method.bind(this._rootAssets ?? this)(...args)
  }

  #syncRootAssets = () => {
    if (this._rootAssets) {
      this.filesystemType = this._rootAssets.filesystemType
      this.archiveHandle = this._rootAssets.archiveHandle
      this.directoryHandle = this._rootAssets.directoryHandle
      this.assetCount = this._rootAssets.assetCount
      // relay the event to local listeners
      this.#emitAssetsUpdated()
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
      this.archiveHandle = undefined
      this.directoryHandle = undefined
    }
  }

  #emitAssetsUpdated() {
    this.dispatchEvent(Bubble<void>('assets-updated', undefined))
  }

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

  async #clearCache() {
    await IDB.delMany([CACHE_LAST_DIR, CACHE_LAST_ZIP])
  }

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
        this.assetCount++
      }
    }
    if (emitEvent) {
      this.#emitAssetsUpdated()
    }
  }

  #clearAssetMap() {
    const assetMap = this.#assetMap!
    for (const entry of Object.keys(assetMap)) {
      const url = assetMap[entry] ?? undefined
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
    this.#assetMap = {}
    this.assetCount = 0
  }

  async #verifyPermissions(handle: FileSystemHandle): Promise<boolean> {
    return (await tryQueryPermission(handle, {mode: 'read'})) === 'granted'
  }
}
