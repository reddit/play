import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
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
import {Bubble} from '../../utils/bubble.js'

declare global {
  interface HTMLElementEventMap {
    'files-selected': CustomEvent<FileSelection>
    cancelled: CustomEvent<never>
  }
  interface HTMLElementTagNameMap {
    'file-upload-dropper': FileUploadDropper
  }
}

export type FileSelection = {
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
  private _dragging: boolean = false

  @state()
  private _errorMessage: string | undefined

  @state()
  private _accept: string | undefined

  #allowedMimes: string[] = []
  #acceptPatterns: RegExp[] = []

  protected override update(changedProperties: PropertyValues) {
    super.update(changedProperties)

    if (changedProperties.has('acceptTypes')) {
      this._accept = flattenAcceptTypes(this.acceptTypes)
      this.#acceptPatterns = this.#extractWildcardTypes()
    }
  }

  protected override render(): TemplateResult {
    return html`
      <input
        type="file"
        id="fileInput"
        accept="${ifDefined(this._accept)}"
        ?multiple="${this.multiple}"
        @change=${this.#processFileInput}
      />
      <label for="${hasFileAccessAPI ? '' : 'fileInput'}">
        <div
          id="fileDrop"
          class="${classMap({dragenter: this._dragging})}"
          @click=${hasFileAccessAPI ? this.#pickFile : undefined}
          @dragenter=${this.#dragStart}
          @dragover=${this.#dragStart}
          @dragleave=${this.#dragEnd}
          @dragend=${this.#dragEnd}
          @drop=${this.#processDrop}
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
  #pickFile = async (): Promise<void> => {
    const fileHandles = await fileAccessContext.showOpenFilePicker({
      ...(this.id ? {id: this.id} : {}),
      types: this.acceptTypes,
      multiple: this.multiple
    })
    if (fileHandles.length > 0) {
      this.dispatchEvent(Bubble<FileSelection>('files-selected', {fileHandles}))
    } else {
      this.dispatchEvent(Bubble<void>('cancelled', undefined))
    }
  }

  /**
   * Handles the <input type=file> field as a fallback
   */
  #processFileInput = async (
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): Promise<void> => {
    if (ev.currentTarget.files) {
      await this.#processFileList(ev.currentTarget.files)
    }
  }

  /**
   * Handles the drag'n'drop result
   */
  #processDrop = async (
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): Promise<void> => {
    ev.preventDefault()
    this.#dragEnd()

    if (!ev.dataTransfer || !this.#validateFileList(ev.dataTransfer.files)) {
      return
    }

    if (hasFileAccessAPI) {
      const fileHandles: FileSystemFileHandle[] = []
      for (let index = 0; index < ev.dataTransfer.items.length; index++) {
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
      this.dispatchEvent(Bubble<FileSelection>('files-selected', {fileHandles}))
    } else {
      await this.#processFileList(ev.dataTransfer.files)
    }
  }

  #processFileList = async (fileList: FileList): Promise<void> => {
    if (!this.#validateFileList(fileList)) {
      return
    }

    this.#clearError()

    const files: File[] = []
    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index]
      if (file) {
        files.push(file)
      }
    }

    this.dispatchEvent(Bubble<FileSelection>('files-selected', {files}))
  }

  #clearError = (): void => {
    this._errorMessage = undefined
  }

  #dragStart = (ev: Event): void => {
    if (ev.type === 'dragover') {
      ev.preventDefault()
    }
    this.#clearError()
    this._dragging = true
  }

  #dragEnd = (): void => {
    this._dragging = false
  }

  #validateFileList(fileList: FileList): boolean {
    return (
      this.#validateFileCount(fileList) && this.#validateFileTypes(fileList)
    )
  }

  #validateFileCount(fileList: FileList): boolean {
    if (fileList.length > 0) {
      if (this.multiple) {
        return fileList.length >= 1
      }
      return fileList.length === 1
    }
    return false
  }

  #validateFileTypes(fileList: FileList): boolean {
    if (this.acceptTypes.length === 0) {
      return true
    }
    for (let index = 0; index < fileList.length; index++) {
      const file = fileList[index]
      if (file && !this.#mimeAllowed(file.type)) {
        this._errorMessage = `Invalid file type provided: ${file.type}`
        return false
      }
    }
    return true
  }

  #mimeAllowed(mimetype: string): boolean {
    if (!(mimetype in this.#allowedMimes)) {
      for (let pattern of this.#acceptPatterns) {
        if (pattern.test(mimetype)) {
          return true
        }
      }
      return false
    }

    return true
  }

  /**
   * Searches for types in the acceptTypes attribute that contain wildcards and
   * converts them to regular expressions for matching in {#mimeAllowed}
   *
   * Example:
   * input: application/*zip
   * output: application/.*zip
   * matches: application/zip, application/x-zip
   * @private
   */
  #extractWildcardTypes(): RegExp[] {
    return this.acceptTypes.flatMap(type =>
      Object.keys(type.accept).flatMap(mimetype => {
        if (mimetype.includes('*')) {
          return new RegExp(mimetype.split('*').join('.*'))
        }
        this.#allowedMimes.push(mimetype)
        return []
      })
    )
  }
}
