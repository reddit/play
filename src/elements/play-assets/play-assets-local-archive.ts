import {customElement, state} from 'lit/decorators.js'
import {css, html, LitElement, type TemplateResult} from 'lit'
import {when} from 'lit-html/directives/when.js'
import {cssReset} from '../../utils/css-reset.js'
import {type FilePickerType} from '../../utils/file-access-api.js'
import type {FileSelection} from './file-upload-dropper.js'
import {assetsContext, PlayAssets} from './play-assets.js'
import {styleMap} from 'lit/directives/style-map.js'
import {consume} from '@lit/context'

import '../play-button.js'
import '../play-icon/play-icon.js'
import './file-upload-dropper.js'

declare global {
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

  @consume({context: assetsContext})
  private _assets!: PlayAssets

  @state()
  private _detailsStyle = STYLE_COLLAPSED

  @state()
  private _selectStyle = STYLE_VISIBLE

  override connectedCallback() {
    super.connectedCallback()

    this._assets.addEventListener('assets-updated', this.#assetsUpdated)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    this._assets.removeEventListener('assets-updated', this.#assetsUpdated)
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
          <pre>${this._assets.archiveFilename}</pre>
          <span>File count: ${this._assets.assetCount}</span>
        </div>
        ${when(
          PlayAssets.hasFileAccessAPI,
          () =>
            html`<play-button
              appearance="bordered"
              size="small"
              icon="restart-outline"
              title="Refresh"
              @click=${() => this._assets.remountLocalArchive()}
            ></play-button>`
        )}
        <play-button
          appearance="bordered"
          size="small"
          icon="share-ios-outline"
          icon-color="red"
          title="Unmount"
          @click=${() => this._assets.unmount()}
        ></play-button>
      </div>
    `
  }

  #onFiles = async (ev: CustomEvent<FileSelection>): Promise<void> => {
    const file = ev.detail.fileHandles?.[0] ?? ev.detail.files?.[0]
    if (file) {
      await this._assets?.mountLocalArchive(file)
    }
  }

  #assetsUpdated = (): void => {
    this._selectStyle = this._assets.isArchiveMounted
      ? STYLE_COLLAPSED
      : STYLE_VISIBLE
    this._detailsStyle = this._assets.isArchiveMounted
      ? STYLE_VISIBLE
      : STYLE_COLLAPSED
    this.requestUpdate()
  }
}
