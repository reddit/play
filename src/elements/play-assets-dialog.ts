import {customElement, property, state} from 'lit/decorators.js'
import {css, type CSSResultGroup, html, type TemplateResult} from 'lit'
import {PlayDialog} from './play-dialog/play-dialog.js'
import {choose} from 'lit-html/directives/choose.js'

import './play-assets/play-assets-local-fs.js'
import './play-assets/play-assets-virtual-fs.js'
import {when} from 'lit-html/directives/when.js'
import {
  type AssetFilesystemType,
  AssetManager
} from '../assets/asset-manager.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-dialog': PlayAssetsDialog
  }
}

@customElement('play-assets-dialog')
export class PlayAssetsDialog extends PlayDialog {
  static override readonly styles: CSSResultGroup = css`
    ${PlayDialog.styles}

    fieldset {
      margin-bottom: var(--space);
    }
  `

  @property({attribute: 'enable-local-assets', type: Boolean})
  enableLocalAssets: boolean = false

  @state()
  _filesystem: AssetFilesystemType = 'virtual'

  override connectedCallback() {
    super.connectedCallback()

    AssetManager.addEventListener('change', this._updateAssetManagerState)
    this._updateAssetManagerState()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    AssetManager.removeEventListener('change', this._updateAssetManagerState)
  }

  override get dialogTitle(): string {
    return 'Assets'
  }

  override get dialogDescription(): string {
    return 'Manage static assets available to blocks in :play'
  }

  override dialogContent(): TemplateResult {
    return html`
      ${when(this.enableLocalAssets, this._renderFilesystemPicker)}

      <fieldset>
        <legend>${this._filesystemTitle}:</legend>
        ${choose(this._filesystem, [
          [
            'virtual',
            () => html`<play-assets-virtual-fs></play-assets-virtual-fs>`
          ],
          ['local', () => html`<play-assets-local-fs></play-assets-local-fs>`]
        ])}
      </fieldset>
    `
  }

  private _renderFilesystemPicker = (): TemplateResult => {
    return html`<fieldset>
      <legend>Filesystem type:</legend>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this._filesystem === 'virtual'}"
          @change=${this._setFilesystem}
          value="virtual"
        />
        Virtual
      </label>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this._filesystem === 'local'}"
          @change=${this._setFilesystem}
          value="local"
        />
        Local
      </label>
    </fieldset>`
  }

  private _setFilesystem(
    ev: InputEvent & {currentTarget: HTMLInputElement}
  ): void {
    AssetManager.filesystemType = ev.currentTarget.value as AssetFilesystemType
  }

  private get _filesystemTitle(): string {
    return this._filesystem === 'virtual' ? 'Manage files' : 'Filesystem source'
  }

  private _updateAssetManagerState = () => {
    this._filesystem = AssetManager.filesystemType
  }
}
