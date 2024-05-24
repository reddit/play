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
import {cssReset} from '../utils/css-reset.js'
import {Bubble} from '../utils/bubble.js'
import {
  type AssetsFilesystemChange,
  type AssetsFilesystemType,
  type AssetsState,
  emptyAssetsState
} from './play-assets/play-assets.js'

import './play-assets/play-assets-virtual-fs.js'
import './play-assets/play-assets-local-directory.js'
import './play-assets/play-assets-local-archive.js'
import './play-dialog/play-dialog.js'

declare global {
  interface HTMLElementEventMap {
    'assets-filesystem-change': CustomEvent<AssetsFilesystemChange>
  }
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

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  @property({attribute: 'enable-local-assets', type: Boolean})
  enableLocalAssets: boolean = false

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
      <play-dialog
        dialog-title="Assets"
        description="Manage static assets available to blocks in :play"
      >
        ${when(this.enableLocalAssets, this.#renderFilesystemPicker)}

        <fieldset>
          <legend>${this.#filesystemTitle}:</legend>
          ${choose(this.assetsState.filesystemType, [
            [
              'virtual',
              () =>
                html`<play-assets-virtual-fs
                  .assetsState=${this.assetsState}
                ></play-assets-virtual-fs>`
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
          ?checked="${this.assetsState.filesystemType === 'virtual'}"
          @change=${this.#setFilesystem}
          value="virtual"
        />
        Virtual
      </label>
      <label>
        <input
          name="filesystemType"
          type="radio"
          ?checked="${this.assetsState.filesystemType === 'local'}"
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
    const filesystemType = ev.currentTarget.value as AssetsFilesystemType
    this.dispatchEvent(
      Bubble<AssetsFilesystemChange>('assets-filesystem-change', {
        kind: 'filesystem-type',
        filesystemType
      })
    )
  }

  #renderLocalFs = (): TemplateResult => {
    return html`
      <div id="localFs">
        ${when(
          this.assetsState.hasFileAccessAPI,
          () =>
            html`<play-assets-local-directory
              .assetsState=${this.assetsState}
            ></play-assets-local-directory>`
        )}
        <play-assets-local-archive
          .assetsState=${this.assetsState}
        ></play-assets-local-archive>
      </div>
    `
  }

  get #filesystemTitle(): string {
    return this.assetsState.filesystemType === 'virtual'
      ? 'Manage files'
      : 'Filesystem source'
  }
}
