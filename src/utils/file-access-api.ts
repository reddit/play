/// <reference lib="dom" />
/**
 * Provides types for the experimental File System Access API available in Chromium-based browsers
 * See: https://wicg.github.io/file-system-access/
 */

type WellKnownPath =
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'

type PermissionMode = 'read' | 'readwrite'

type PermissionState = PermissionStatus['state']

export type FilePickerType = {
  description?: string
  accept: {[mimetype: string]: string[]}
}

type SharedPickerOptions = {
  id?: unknown
  startIn?: WellKnownPath | FileSystemHandle
}

type SharedFilePickerOptions = SharedPickerOptions & {
  excludeAcceptAllOption?: boolean
  types?: FilePickerType[]
}

type ShowOpenFilePickerOptions = SharedFilePickerOptions & {
  multiple?: boolean
}

type ShowSaveFilePickerOptions = SharedFilePickerOptions & {
  suggestedName?: string
}

type ShowDirectoryPickerOptions = SharedPickerOptions & {
  mode?: PermissionMode
}

type FileAccessAPI = {
  showOpenFilePicker: (
    options?: ShowOpenFilePickerOptions
  ) => Promise<FileSystemFileHandle[]>

  showSaveFilePicker: (
    options?: ShowSaveFilePickerOptions
  ) => Promise<FileSystemFileHandle>

  showDirectoryPicker: (
    options?: ShowDirectoryPickerOptions
  ) => Promise<FileSystemDirectoryHandle>
}

type FileAccessDataTransferItem = {
  getAsFileSystemHandle: () => Promise<
    FileSystemFileHandle | FileSystemDirectoryHandle | null
  >
}

type FileAccessPermissionOptions = {
  mode: PermissionMode
}

type FileHandleWithPermissions = FileSystemHandle & {
  queryPermission: (
    options?: FileAccessPermissionOptions
  ) => Promise<PermissionState>
  requestPermission: (
    options?: FileAccessPermissionOptions
  ) => Promise<PermissionState>
}

export const fileAccessContext = window as typeof window & FileAccessAPI

export const hasFileAccessAPI =
  globalThis.DataTransferItem &&
  'getAsFileSystemHandle' in DataTransferItem.prototype

/**
 * Attempts to acquire a FileSystemHandle from a DataTransferItem if running in a
 * browser with File Access API, otherwise returns null
 * @param item
 */
export async function tryGetAsFilesystemHandle(
  item: DataTransferItem
): ReturnType<FileAccessDataTransferItem['getAsFileSystemHandle']> {
  if ('getAsFileSystemHandle' in item) {
    return (item as FileAccessDataTransferItem).getAsFileSystemHandle()
  }
  return Promise.resolve(null)
}

export async function tryQueryPermission(
  handle: FileSystemHandle,
  options: FileAccessPermissionOptions
): Promise<PermissionState> {
  if ('queryPermission' in handle) {
    return (handle as FileHandleWithPermissions).queryPermission(options)
  }
  return 'denied'
}

/**
 * Convert the File Access API style accept object to a flat string suitable for <input type=file>
 * @param types Array of FilePickerType objects
 */
export function flattenAcceptTypes(
  types: FilePickerType[] | undefined
): string | undefined {
  // Input:
  // [
  //   {
  //     description: 'Lossless image',
  //     accept: {
  //       'image/png': ['*.png'],
  //       'image/bmp': ['*.bmp', '*.dib'],
  //     },
  //   },
  //   {
  //     description: 'Lossy image',
  //     accept: {
  //       'image/jpeg': ['*.jpg', '*.jpeg', '*.jpe', '*.jfif'],
  //       'image/gif': ['*.gif'],
  //     },
  //   },
  // ]
  // Output:
  // 'image/png,*.png,image/bmp,*.bmp,*.dib,image/jpeg,*.jpg,*.jpeg,*.jpe,*.jfif,image/gif,*.gif'
  return types
    ?.map(type =>
      Object.entries(type.accept)
        .map(([mimetype, extensions]) => `${mimetype},${extensions.join()}`)
        .join()
    )
    ?.join()
}
