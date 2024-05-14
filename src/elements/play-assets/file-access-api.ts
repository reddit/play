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

type DirectoryAccessMode = 'read' | 'readwrite'

type FilePickerType = {
  description?: string
  accept: {[key: string]: string[]}
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
  mode?: DirectoryAccessMode
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

export const fileAccessContext = window as typeof window & FileAccessAPI

export const hasFileAccessAPI = 'getAsFileSystemHandle' in DataTransferItem.prototype

export async function tryGetAsFilesystemHandle(
  item: DataTransferItem
): ReturnType<FileAccessDataTransferItem['getAsFileSystemHandle']> {
  if ('getAsFileSystemHandle' in item) {
    return (item as FileAccessDataTransferItem).getAsFileSystemHandle()
  }
  return Promise.resolve(null)
}
