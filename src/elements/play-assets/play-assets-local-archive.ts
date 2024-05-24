import {customElement, property, state} from 'lit/decorators.js'
import {
  css,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {when} from 'lit-html/directives/when.js'
import {cssReset} from '../../utils/css-reset.js'
import {type FilePickerType} from '../../utils/file-access-api.js'
import type {FileSelection} from './file-upload-dropper.js'
import {styleMap} from 'lit/directives/style-map.js'

import '../play-button.js'
import '../play-icon/play-icon.js'
import './file-upload-dropper.js'
import {
  type AssetsFilesystemChange,
  type AssetsState,
  emptyAssetsState
} from './play-assets.js'
import {Bubble} from '../../utils/bubble.js'

declare global {
  interface HTMLElementEventMap {
    'assets-filesystem-change': CustomEvent<AssetsFilesystemChange>
  }
  interface HTMLElementTagNameMap {
    'play-assets-local-archive': PlayAssetsLocalArchive
  }
}

const STYLE_VISIBLE = {visibility: 'visible'}
const STYLE_COLLAPSED = {visibility: 'collapse'}

@customElement('play-assets-local-archive')
export class PlayAssetsLocalArchive extends LitElement {
  static override readonly styles = css`
    ${cssReset}

    :host {
      display: grid;
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    :host > * {
      grid-column-start: 1;
      grid-row-start: 1;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .row .grow {
      flex-grow: 1;
    }

    .row.gap {
      gap: 8px;
    }
  `

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  @state()
  private _detailsStyle = STYLE_COLLAPSED

  @state()
  private _selectStyle = STYLE_VISIBLE

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('assetsState')) {
      this._selectStyle = this.assetsState.archiveFilename
        ? STYLE_COLLAPSED
        : STYLE_VISIBLE
      this._detailsStyle = this.assetsState.archiveFilename
        ? STYLE_VISIBLE
        : STYLE_COLLAPSED
    }
  }

  protected override render(): TemplateResult {
    return html` ${this.#renderArchiveDetails()} ${this.#renderMountArchive()} `
  }

  #renderMountArchive = (): TemplateResult => {
    const types: FilePickerType[] = [
      {
        description: 'ZIP Archive',
        accept: {
          'application/*zip': ['.zip']
        }
      }
    ]

    return html`
      <div style="${styleMap(this._selectStyle)}">
        <span>ZIP archive:</span>
        <file-upload-dropper
          id="archive-picker"
          .acceptTypes="${types}"
          @files-selected=${this.#onFiles}
        >
          <play-icon size="32px" icon="archived-outline"></play-icon>
          <span>Click to select a ZIP archive</span>
          <span>or</span>
          <span>Drop a ZIP file here</span>
        </file-upload-dropper>
      </div>
    `
  }

  #renderArchiveDetails = (): TemplateResult => {
    return html`
      <div class="row gap" style="${styleMap(this._detailsStyle)}">
        <div class="column grow">
          <span>Mounted archive:</span>
          <pre>${this.assetsState.archiveFilename}</pre>
          <span>File count: ${this.assetsState.count}</span>
        </div>
        ${when(
          this.assetsState.hasFileAccessAPI,
          () =>
            html`<play-button
              appearance="bordered"
              size="small"
              icon="restart-outline"
              title="Refresh"
              @click=${() => this.#emitChange({kind: 'remount-archive'})}
            ></play-button>`
        )}
        <play-button
          appearance="bordered"
          size="small"
          icon="share-ios-outline"
          icon-color="red"
          title="Unmount"
          @click=${() => this.#emitChange({kind: 'unmount'})}
        ></play-button>
      </div>
    `
  }

  #onFiles = async (ev: CustomEvent<FileSelection>): Promise<void> => {
    const file = ev.detail.fileHandles?.[0] ?? ev.detail.files?.[0]
    if (file) {
      this.#emitChange({kind: 'mount-archive', archiveHandle: file})
    }
  }

  #emitChange(change: AssetsFilesystemChange): void {
    this.dispatchEvent(
      Bubble<AssetsFilesystemChange>('assets-filesystem-change', change)
    )
  }
}
