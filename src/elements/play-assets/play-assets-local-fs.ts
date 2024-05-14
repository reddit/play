import {customElement, query, state} from 'lit/decorators.js'
import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {cssReset} from '../../utils/css-reset.js'
import {when} from 'lit-html/directives/when.js'
import {classMap} from 'lit-html/directives/class-map.js'

import '../play-icon/play-icon.js'
import {AssetManager} from '../../assets/asset-manager.js'
import {fileAccessContext, tryGetAsFilesystemHandle} from './file-access-api.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-local-fs': PlayAssetsLocalFilesystem
  }
}

@customElement('play-assets-local-fs')
export class PlayAssetsLocalFilesystem extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    :host {
      display: flex;
      flex-direction: column;
    }

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
    }

    #fileDrop.dragenter {
      border-color: blue;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .row.vcenter {
      align-items: center;
    }

    .row .grow,
    .column .grow {
      flex-grow: 1;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .no-selection {
      font-size: 0.9em;
      color: darkgrey;
      font-style: italic;
    }
  `

  @state()
  _dragEnter: boolean = false

  @state()
  _dropError: string | undefined

  @state()
  _isDirectoryMounted: boolean = AssetManager.isDirectoryMounted

  @state()
  _isArchiveMounted: boolean = AssetManager.isArchiveMounted

  @state()
  _archiveCanRemount: boolean = AssetManager.hasFileAccessAPI

  @state()
  _mountedDirectory: string = AssetManager.directoryName

  @state()
  _mountedArchive: string = AssetManager.archiveFilename

  @state()
  _assetCount: number = AssetManager.fileCount

  @query('input[type=file]')
  _archiveFileInput!: HTMLInputElement

  override connectedCallback() {
    super.connectedCallback()

    AssetManager.addEventListener('change', this._updateMountState)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    AssetManager.removeEventListener('change', this._updateMountState)
  }

  protected override render(): TemplateResult {
    return html`
      ${when('showDirectoryPicker' in window, this._mountDirectory)}
      ${when(
        this._isArchiveMounted,
        this._renderArchiveDetails,
        this._renderMountArchive
      )}
    `
  }

  private _mountDirectory = () => {
    return html`
      <span>Local directory:</span>
      <div class="row vcenter">
        ${when(
          this._isDirectoryMounted,
          () =>
            html`<pre class="grow">.../${this._mountedDirectory}</pre>
              <play-button
                appearance="bordered"
                size="small"
                icon="share-ios-outline"
                icon-color="red"
                title="Unmount"
              ></play-button>`,
          () =>
            html`<span class="no-selection grow">No directory selected</span
              ><play-button
                appearance="inverted"
                size="small"
                label="Select"
                @click=${this._pickDirectory}
              ></play-button>`
        )}
      </div>
    `
  }

  private _renderMountArchive = () => {
    return html`
      <span>ZIP archive:</span>
      <input
        type="file"
        id="fileInput"
        accept=".zip,application/x-zip"
        @change=${this._processFileInput}
      />
      <label for="${AssetManager.hasFileAccessAPI ? undefined : 'fileInput'}">
        <div
          id="fileDrop"
          class="${classMap({dragenter: this._dragEnter})}"
          @click=${AssetManager.hasFileAccessAPI
            ? this._pickArchive
            : undefined}
          @dragenter=${() => {
            this._dropError = undefined
            this._dragEnter = true
          }}
          @dragover=${(ev: Event) => {
            ev.preventDefault()
            this._dragEnter = true
          }}
          @dragleave=${() => (this._dragEnter = false)}
          @dragend=${() => (this._dragEnter = false)}
          @drop=${this._processDrop}
        >
          <play-icon size="32px" icon="archived-outline"></play-icon>
          <span>Click to select a ZIP archive</span>
          <span>or</span>
          <span>Drop a ZIP file here</span>
          <span>${this._dropError}</span>
        </div>
      </label>
    `
  }

  private _renderArchiveDetails = () => {
    return html`
      <div class="row">
        <div class="column grow">
          <span>Mounted archive: ${this._mountedArchive}</span>
          <span>File count: ${this._assetCount}</span>
        </div>
        ${when(
          this._archiveCanRemount,
          () =>
            html`<play-button
              appearance="bordered"
              size="small"
              icon="restart-outline"
              title="Refresh"
              @click=${() => AssetManager.remountLocalArchive()}
            ></play-button>`
        )}
        <play-button
          appearance="bordered"
          size="small"
          icon="share-ios-outline"
          icon-color="red"
          title="Unmount"
          @click=${this._unmountRoot}
        ></play-button>
      </div>
    `
  }

  private _pickDirectory = async () => {
    const directoryHandle = await fileAccessContext.showDirectoryPicker({
      id: 'selectDirectory',
      mode: 'read'
    })
    if (directoryHandle) {
      await AssetManager.mountLocalDirectory(directoryHandle)
    }
  }

  private _pickArchive = async () => {
    const [fileHandle] = await fileAccessContext.showOpenFilePicker({
      id: 'selectArchive',
      types: [
        {
          description: 'ZIP Archive',
          accept: {
            'application/*zip': ['.zip']
          }
        }
      ]
    })
    if (fileHandle) {
      await AssetManager.mountLocalArchive(fileHandle)
    }
  }

  private async _processDrop(
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): Promise<void> {
    ev.preventDefault()
    this._dragEnter = false
    if (ev.dataTransfer) {
      if (!this._validateArchiveCount(ev.dataTransfer.items.length)) {
        return
      }
      const item = ev.dataTransfer.items[0]
      if (item && 'getAsFileSystemHandle' in item) {
        const handle = await tryGetAsFilesystemHandle(item)
        if (handle) {
          if (handle.kind === 'file') {
            await AssetManager.mountLocalArchive(handle)
          } else {
            this._dropError = 'Directories cannot be dropped here.'
          }
        }
      } else {
        await this._processArchiveFileList(ev.dataTransfer.files)
      }
    }
  }

  private async _processFileInput(
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): Promise<void> {
    if (ev.currentTarget.files) {
      await this._processArchiveFileList(ev.currentTarget.files)
    }
  }

  private async _processArchiveFileList(files: FileList): Promise<void> {
    if (!this._validateArchiveCount(files.length)) {
      return
    }
    const file = files[0]
    if (
      file &&
      file.type.startsWith('application/') &&
      file.type.endsWith('zip')
    ) {
      this._dropError = undefined
      await AssetManager.mountLocalArchive(file)
    } else {
      this._dropError = 'Invalid file type provided.  Please select a ZIP file.'
      console.debug(`Invalid file type: ${file?.type}`)
    }
  }

  private _validateArchiveCount(count: number): boolean {
    if (count > 1) {
      this._dropError = 'Only one ZIP archive may be mounted.'
      return false
    }
    return true
  }

  private async _unmountRoot(): Promise<void> {
    await AssetManager.unmount()
  }

  private _updateMountState = () => {
    this._isDirectoryMounted = AssetManager.isDirectoryMounted
    this._isArchiveMounted = AssetManager.isArchiveMounted
    this._archiveCanRemount = AssetManager.hasFileAccessAPI
    this._mountedArchive = AssetManager.archiveFilename
    this._mountedDirectory = AssetManager.directoryName
    this._assetCount = AssetManager.fileCount
  }
}
