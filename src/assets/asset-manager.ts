import type {AssetMap} from '@devvit/shared-types/Assets.js'
import * as ZenFS from '@zenfs/core'
import {FileSystem, fs} from '@zenfs/core'
import {WebStorage, WebAccess} from '@zenfs/dom'
import {Zip} from '@zenfs/zip'
import * as IDB from 'idb-keyval'
import {hasFileAccessAPI} from '../elements/play-assets/file-access-api.js'

export type AssetFilesystemType = 'virtual' | 'local'
export type LocalSourceType = 'directory' | 'archive' | undefined

const LOG_TAG = '[AssetManager]'

const CACHE_LAST_DIR = 'lastMountedDirectory'
const CACHE_LAST_ZIP = 'lastMountedArchive'

export class AssetManager {
  private static _filesystemType: AssetFilesystemType = 'virtual'
  private static _assetMap: AssetMap = {}
  private static _assetCount: number = 0
  private static _eventTarget: EventTarget = new EventTarget()
  private static _directoryHandle: FileSystemDirectoryHandle | undefined
  private static _archiveHandle: FileSystemFileHandle | File | undefined

  static get filesystemType(): AssetFilesystemType {
    return this._filesystemType
  }

  static set filesystemType(type: AssetFilesystemType) {
    if (type !== this._filesystemType) {
      void this.initialize(type)
    }
  }

  static get isDirectoryMounted(): boolean {
    return this._directoryHandle !== undefined
  }

  static get isArchiveMounted(): boolean {
    return this._archiveHandle !== undefined
  }

  static get directoryName(): string {
    return this._directoryHandle?.name ?? ''
  }

  static get archiveFilename(): string {
    return this._archiveHandle?.name ?? ''
  }

  static get fileCount(): number {
    return this._assetCount
  }

  static get hasFileAccessAPI(): boolean {
    return hasFileAccessAPI
  }

  static get assetMap(): Promise<AssetMap> {
    const resolvedMap = () => Promise.resolve(this._assetMap)
    if (this.isDirectoryMounted) {
      return this._updateMap().then(resolvedMap)
    }
    return resolvedMap()
  }

  static async initialize(filesystemType: AssetFilesystemType): Promise<void> {
    this._filesystemType = filesystemType || 'virtual'
    if (filesystemType === 'virtual') {
      await this.mountVirtualFs()
    } else {
      const [lastMountedDirectory, lastMountedArchive] = await IDB.getMany([
        CACHE_LAST_DIR,
        CACHE_LAST_ZIP
      ])

      if (lastMountedDirectory) {
        await this.mountLocalDirectory(lastMountedDirectory)
      } else if (lastMountedArchive) {
        await this.mountLocalArchive(lastMountedArchive)
      }
    }
  }

  static addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    this._eventTarget.addEventListener(type, callback, options)
  }

  static dispatchEvent(event: Event): boolean {
    return this._eventTarget.dispatchEvent(event)
  }

  static removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions | undefined
  ): void {
    this._eventTarget.removeEventListener(type, callback, options)
  }

  static async mountVirtualFs(): Promise<void> {
    await this._mountRoot(WebStorage.create({}))
    this._emitChangeEvent()
  }

  static async mountLocalDirectory(
    directoryHandle: FileSystemDirectoryHandle
  ): Promise<void> {
    await this._mountRoot(WebAccess.create({handle: directoryHandle}))
    await this._updateCache({directory: directoryHandle})
    this._directoryHandle = directoryHandle
    this._archiveHandle = undefined
    this._emitChangeEvent()
  }

  static async mountLocalArchive(
    fileHandle: FileSystemFileHandle | File
  ): Promise<void> {
    let file
    if ('getFile' in fileHandle) {
      file = await fileHandle.getFile()
    } else {
      file = fileHandle as File
    }
    await this._mountRoot(Zip.create({zipData: await file.arrayBuffer()}))
    await this._updateCache({file: fileHandle})
    this._archiveHandle = fileHandle
    this._directoryHandle = undefined
    this._emitChangeEvent()
  }

  static async remountLocalArchive(): Promise<void> {
    if (this._archiveHandle) {
      await this.mountLocalArchive(this._archiveHandle)
    }
  }

  static async unmount(): Promise<void> {
    this._unmountRoot()
    await this._updateMap()
    await this._updateCache({})
    this._emitChangeEvent()
  }

  private static async _mountRoot(fs: FileSystem): Promise<void> {
    this._unmountRoot()
    ZenFS.mount('/', fs)
    await this._updateMap()
  }

  private static _unmountRoot(): void {
    if (ZenFS.mounts.has('/')) {
      ZenFS.umount('/')
      this._archiveHandle = undefined
      this._directoryHandle = undefined
    }
  }

  private static async _updateMap(): Promise<void> {
    this._assetMap = {}
    this._assetCount = 0
    if (!ZenFS.mounts.has('/')) {
      console.debug(LOG_TAG, 'Root filesystem unmounted, skipping _updateMap')
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
        const url = window.URL.createObjectURL(new Blob([buffer]))
        this._assetMap[name] = url
        this._assetCount++
      }
    }
    console.debug(LOG_TAG, `Found ${this._assetCount} files`, this._assetMap)
  }

  private static async _updateCache(handles: {
    directory?: FileSystemDirectoryHandle | undefined
    file?: FileSystemFileHandle | File | undefined
  }): Promise<void> {
    await IDB.del(CACHE_LAST_DIR)
    await IDB.del(CACHE_LAST_ZIP)
    await IDB.set(CACHE_LAST_DIR, handles.directory)
    await IDB.set(CACHE_LAST_ZIP, handles.file)
  }

  private static _emitChangeEvent(): void {
    this._eventTarget.dispatchEvent(new CustomEvent('change'))
  }
}
