import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {AssetManager} from '../../assets/asset-manager.js'
import {classMap} from 'lit-html/directives/class-map.js'
import {ifDefined} from 'lit-html/directives/if-defined.js'
import {
  fileAccessContext,
  type FilePickerType,
  flattenAcceptTypes,
  hasFileAccessAPI,
  tryGetAsFilesystemHandle
} from '../../utils/file-access-api.js'
import {cssReset} from '../../utils/css-reset.js'

const LOG_TAG = 'FileUploadDropper'

declare global {
  interface HTMLElementEventMap {
    'files-selected': CustomEvent<FilesSelectedEvent>
    cancelled: CustomEvent<never>
  }
  interface HTMLElementTagNameMap {
    'file-upload-dropper': FileUploadDropper
  }
}

export type FilesSelectedEvent = {
  // Provided in fallback environments where File Access API is not available
  files?: File[]
  // Provided in environments where File Access API is available
  fileHandles?: FileSystemFileHandle[]
}

@customElement('file-upload-dropper')
export class FileUploadDropper extends LitElement {
  static override readonly styles = css`
    ${cssReset}

    input[type='file'] {
      display: none;
    }

    #fileDrop {
      border: 3px dashed black;
      border-radius: 8px;
      padding: var(--space);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }

    #fileDrop.dragenter {
      border-color: blue;
    }

    #errorMessage {
      color: red;
      font-size: 0.9em;
    }
  `

  @property({attribute: 'accept-types', type: Array, reflect: true})
  acceptTypes: FilePickerType[] = []

  @property({attribute: 'multiple', type: Boolean, reflect: true})
  multiple: boolean = false

  @state()
  _dragging: boolean = false

  @state()
  _errorMessage: string | undefined

  @state()
  _accept: string | undefined

  private _acceptPatterns: RegExp[] = []

  protected override willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('acceptTypes')) {
      this._accept = flattenAcceptTypes(this.acceptTypes)
      this._acceptPatterns = this.acceptTypes.flatMap(type =>
        Object.keys(type).flatMap(mimetype => {
          if (mimetype.includes('*')) {
            return new RegExp(mimetype.split('*').join('.*'))
          }
          return []
        })
      )
    }
  }

  protected override render(): TemplateResult {
    return html`
      <input
        type="file"
        id="fileInput"
        accept="${ifDefined(this._accept)}"
        ?multiple="${this.multiple}"
        @change=${this._processFileInput}
      />
      <label for="${AssetManager.hasFileAccessAPI ? undefined : 'fileInput'}">
        <div
          id="fileDrop"
          class="${classMap({dragenter: this._dragging})}"
          @click=${AssetManager.hasFileAccessAPI ? this._pickFile : undefined}
          @dragenter=${this._dragStart}
          @dragover=${this._dragStart}
          @dragleave=${this._dragEnd}
          @dragend=${this._dragEnd}
          @drop=${this._processDrop}
        >
          <slot></slot>
          <span id="errorMessage">${this._errorMessage}</span>
        </div>
      </label>
    `
  }

  /**
   * Uses File Access API to get FileSystemFileHandles
   */
  private _pickFile = async () => {
    const fileHandles = await fileAccessContext.showOpenFilePicker({
      ...(this.id ? {id: this.id} : {}),
      types: this.acceptTypes,
      multiple: this.multiple
    })
    if (fileHandles.length > 0) {
      this.dispatchEvent(
        new CustomEvent<FilesSelectedEvent>('files-selected', {
          detail: {fileHandles}
        })
      )
    } else {
      this.dispatchEvent(new CustomEvent('cancelled'))
    }
  }

  /**
   * Handles the <input type=file> field as a fallback
   */
  private _processFileInput = async (
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): Promise<void> => {
    if (ev.currentTarget.files) {
      await this._processFileList(ev.currentTarget.files)
    }
  }

  /**
   * Handles the drag'n'drop result
   */
  private _processDrop = async (
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ) => {
    ev.preventDefault()
    this._dragEnd()

    if (!ev.dataTransfer || !this._validateFileList(ev.dataTransfer.files)) {
      console.debug(LOG_TAG, 'No files in drop event', ev)
      return
    }

    if (hasFileAccessAPI) {
      const fileHandles: FileSystemFileHandle[] = []
      for (const index in ev.dataTransfer.items) {
        const item = ev.dataTransfer.items[index]
        if (item) {
          const handle = await tryGetAsFilesystemHandle(item)
          if (handle) {
            if (handle.kind === 'file') {
              fileHandles.push(handle)
            } else {
              this._errorMessage = 'Directories cannot be dropped here.'
              return
            }
          }
        }
      }
      console.debug(LOG_TAG, 'Dropped files:', fileHandles.length)
      this.dispatchEvent(
        new CustomEvent('files-selected', {detail: {fileHandles}})
      )
    } else {
      await this._processFileList(ev.dataTransfer.files)
    }
  }

  private _processFileList = async (fileList: FileList): Promise<void> => {
    if (!this._validateFileList(fileList)) {
      return
    }

    this._clearError()

    const files: File[] = []
    for (const index in fileList) {
      const file = fileList[index]
      if (file) {
        files.push(file)
      }
    }

    this.dispatchEvent(
      new CustomEvent<FilesSelectedEvent>('onfiles', {detail: {files}})
    )
  }

  private _clearError = () => {
    this._errorMessage = undefined
  }

  private _dragStart = (ev: Event) => {
    if (ev.type === 'dragover') {
      ev.preventDefault()
    }
    this._clearError()
    this._dragging = true
  }

  private _dragEnd = () => {
    this._dragging = false
  }

  private _validateFileList(fileList: FileList): boolean {
    return (
      this._validateFileCount(fileList) && this._validateFileTypes(fileList)
    )
  }

  private _validateFileCount(fileList: FileList): boolean {
    if (fileList.length > 0) {
      if (this.multiple) {
        return fileList.length >= 1
      }
      return fileList.length === 1
    }
    return false
  }

  private _validateFileTypes(fileList: FileList): boolean {
    if (this.acceptTypes.length === 0) {
      return true
    }
    for (const index in fileList) {
      const file = fileList[index]
      if (file && !this._mimeAllowed(file.type)) {
        this._errorMessage = `Invalid file type provided: ${file.type}`
        return false
      }
    }
    return true
  }

  private _mimeAllowed(mimetype: string): boolean {
    const allowedMimes = Object.keys(this.acceptTypes)
    if (!(mimetype in allowedMimes)) {
      for (let pattern of this._acceptPatterns) {
        if (pattern.test(mimetype)) {
          return true
        }
      }
      return false
    }

    return true
  }
}
