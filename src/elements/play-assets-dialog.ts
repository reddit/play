import {customElement, property, query} from 'lit/decorators.js'
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
  assetsContext,
  PlayAssets
} from './play-assets/play-assets.js'
import {cssReset} from '../utils/css-reset.js'
import {consume} from '@lit/context'

import './play-assets/play-assets.js'
import './play-assets/play-assets-virtual-fs.js'
import './play-assets/play-assets-local-directory.js'
import './play-assets/play-assets-local-archive.js'
import './play-dialog/play-dialog.js'
import {Bubble} from '../utils/bubble.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-assets-dialog': PlayAssetsDialog
  }
}

@customElement('play-assets-dialog')
export class PlayAssetsDialog extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    legend {
      font-weight: bold;
    }

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

  @consume({context: assetsContext})
  private _assets!: PlayAssets

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  open(): void {
    this._dialog.open()
  }

  close(): void {
    this._dialog.close()
  }

  override connectedCallback() {
    super.connectedCallback()

    this._assets.addEventListener('assets-updated', this.#assetsUpdated)
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    this._assets.removeEventListener('assets-updated', this.#assetsUpdated)
  }

  protected override render(): TemplateResult {
    return html`
      <play-dialog
        dialog-title="Assets"
        description="Manage static assets available to blocks in :play"
      >
        ${when(this.enableLocalAssets, this.#renderFilesystemPicker)}

        <fieldset>
          <legend>${this.#filesystemTitle}:</legend>
          ${choose(this._assets.filesystemType, [
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
          ?checked="${this._assets.filesystemType === 'virtual'}"
          @change=${this.#setFilesystem}
          value="virtual"
        />
        Virtual
      </label>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this._assets.filesystemType === 'local'}"
          @change=${this.#setFilesystem}
          value="local"
        />
        Local
      </label>
    </fieldset>`
  }

  #setFilesystem = (
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): void => {
    const filesystemType = ev.currentTarget.value as AssetFilesystemType
    this.dispatchEvent(
      Bubble<AssetFilesystemType>('assets-set-filesystem', filesystemType)
    )
  }

  #renderLocalFs = (): TemplateResult => {
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

  get #filesystemTitle(): string {
    return this._assets.filesystemType === 'virtual'
      ? 'Manage files'
      : 'Filesystem source'
  }

  #assetsUpdated = (): void => {
    this.requestUpdate()
  }
}
