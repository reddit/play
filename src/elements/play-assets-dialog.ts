import {customElement, property, query, state} from 'lit/decorators.js'
import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {PlayDialog} from './play-dialog/play-dialog.js'
import {choose} from 'lit-html/directives/choose.js'
import {when} from 'lit-html/directives/when.js'
import {
  type AssetFilesystemType,
  PlayAssets
} from './play-assets/play-assets.js'

import './play-assets/play-assets.js'
import './play-assets/play-assets-virtual-fs.js'
import './play-assets/play-assets-local-directory.js'
import './play-assets/play-assets-local-archive.js'
import './play-dialog/play-dialog.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-dialog': PlayAssetsDialog
  }
}

@customElement('play-assets-dialog')
export class PlayAssetsDialog extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${PlayDialog.styles}

    fieldset {
      margin-bottom: var(--space);
    }

    #localFs {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `

  @property({attribute: 'enable-local-assets', type: Boolean})
  enableLocalAssets: boolean = false

  @state()
  private _filesystemType: AssetFilesystemType = 'virtual'

  @query('play-assets')
  private _assets: PlayAssets | undefined

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  open(): void {
    this._dialog.open()
  }

  close(): void {
    this._dialog.close()
  }

  protected override render(): TemplateResult {
    return html`
      <play-assets @assets-updated=${this.#assetsUpdated}></play-assets>
      <play-dialog
        title="Assets"
        description="Manage static assets available to blocks in :play"
      >
        ${when(this.enableLocalAssets, this.#renderFilesystemPicker)}

        <fieldset>
          <legend>${this.#filesystemTitle}:</legend>
          ${choose(this._filesystemType, [
            [
              'virtual',
              () => html`<play-assets-virtual-fs></play-assets-virtual-fs>`
            ],
            ['local', this.#renderLocalFs]
          ])}
        </fieldset>
      </play-dialog>
    `
  }

  #renderFilesystemPicker = (): TemplateResult => {
    return html`<fieldset>
      <legend>Filesystem type:</legend>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this._filesystemType === 'virtual'}"
          @change=${this.#setFilesystem}
          value="virtual"
        />
        Virtual
      </label>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this._filesystemType === 'local'}"
          @change=${this.#setFilesystem}
          value="local"
        />
        Local
      </label>
    </fieldset>`
  }

  #setFilesystem = (ev: InputEvent & {currentTarget: HTMLInputElement}) => {
    if (this._assets) {
      this._assets.filesystemType = ev.currentTarget
        .value as AssetFilesystemType
      this.requestUpdate()
    }
  }

  #renderLocalFs = () => {
    return html`
      <div id="localFs">
        ${when(
          PlayAssets.hasFileAccessAPI,
          () =>
            html`<play-assets-local-directory></play-assets-local-directory>`
        )}
        <play-assets-local-archive></play-assets-local-archive>
      </div>
    `
  }

  #assetsUpdated = () => {
    this._filesystemType = this._assets?.filesystemType ?? 'virtual'
  }

  get #filesystemTitle(): string {
    return this._filesystemType === 'virtual'
      ? 'Manage files'
      : 'Filesystem source'
  }
}
