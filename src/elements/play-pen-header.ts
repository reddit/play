import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {defaultSettings} from '../storage/settings-save.js'
import {Bubble} from '../utils/bubble.js'
import {cssReset} from '../utils/css-reset.js'
import {openURL} from '../utils/open-url.js'
import type {PlayExportDialog} from './play-export-dialog.js'
import type {PlaySettingsDialog} from './play-settings-dialog.js'
import type {PlayAssetsDialog} from './play-assets-dialog.js'

import './play-button.js'
import './play-export-dialog.js'
import './play-icon/play-icon.js'
import './play-logo/play-logo.js'
import './play-new-pen-button.js'
import './play-resizable-text-input.js'
import './play-settings-dialog.js'
import './play-assets-dialog.js'
import {type AssetsState, emptyAssetsState} from './play-assets/play-assets.js'

declare global {
  interface HTMLElementEventMap {
    'edit-name': CustomEvent<string>
    share: CustomEvent<undefined>
  }
  interface HTMLElementTagNameMap {
    'play-pen-header': PlayPenHeader
  }
}

@customElement('play-pen-header')
export class PlayPenHeader extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    header {
      padding-top: 16px;
      padding-right: 16px;
      padding-bottom: 16px;
      padding-left: 16px;
      display: flex;
      flex-direction: row;
      column-gap: 32px;
      justify-content: space-between;
      align-items: center;
      background-color: var(--color-background);
    }

    .titling {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 8px;
      row-gap: 8px;
    }

    play-logo {
      flex-shrink: 0;
    }

    .actions {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      align-items: center;
    }
  `

  @property({attribute: 'allow-storage', type: Boolean})
  allowStorage: boolean = false

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  @property({attribute: 'enable-local-assets', type: Boolean})
  enableLocalAssets: boolean = false

  @property()
  name: string = ''

  @property({attribute: false})
  srcByLabel?: {readonly [key: string]: string}

  @property({attribute: 'remote-runtime-origin'})
  remoteRuntimeOrigin: string = defaultSettings.remoteRuntimeOrigin

  @property({attribute: 'runtime-debug-logging', type: Boolean})
  runtimeDebugLogging: boolean = false

  @property({attribute: 'sandbox-app', type: Boolean})
  sandboxApp: boolean = false

  @property()
  url: string = ''

  @property({attribute: 'use-experimental-blocks', type: Boolean})
  useExperimentalBlocks: boolean = false

  @property({attribute: 'use-speculative-execution', type: Boolean})
  useSpeculativeExecution: boolean = false

  @property({attribute: 'use-ui-request', type: Boolean})
  useUIRequest: boolean = false

  @property({attribute: 'use-local-runtime', type: Boolean})
  useLocalRuntime: boolean = false

  @property({attribute: 'use-remote-runtime', type: Boolean})
  useRemoteRuntime: boolean = false

  @query('play-assets-dialog')
  private _assets!: PlayAssetsDialog

  @query('play-export-dialog')
  private _export!: PlayExportDialog

  @query('play-settings-dialog')
  private _settings!: PlaySettingsDialog

  protected override render(): TemplateResult {
    return html`
      <header>
        <div class="titling">
          <play-logo></play-logo>
          <play-resizable-text-input
            @edit-text=${(ev: CustomEvent<string>) =>
              this.dispatchEvent(Bubble<string>('edit-name', ev.detail))}
            placeholder="Untitled"
            .text=${this.name}
          ></play-resizable-text-input>
        </div>
        <div class="actions">
          <play-new-pen-button
            size="small"
            .srcByLabel=${this.srcByLabel}
          ></play-new-pen-button
          ><play-button
            appearance="bordered"
            size="small"
            icon="reading-outline"
            title="Open Documentation"
            label="Docs"
            @click=${() => openURL('https://developers.reddit.com/docs')}
          ></play-button
          ><play-button
            appearance="bordered"
            size="small"
            icon="download-outline"
            title="Export Pen"
            label="Export"
            @click=${() => this._export.open()}
          ></play-button
          ><play-button
            appearance="bordered"
            size="small"
            icon="assets-outline"
            title="Assets"
            label="Assets"
            @click=${() => this._assets.open()}
          ></play-button>
          <play-button
            appearance="bordered"
            size="small"
            title=":play Settings"
            label="Settings"
            @click=${() => this._settings.open()}
          ></play-button
          ><play-button
            appearance="orangered"
            size="small"
            icon="share-new-outline"
            title="Copy URL to Clipboard"
            label="Share"
            @click=${() =>
              this.dispatchEvent(Bubble<undefined>('share', undefined))}
          ></play-button>
        </div>
      </header>
      <play-assets-dialog
        .assetsState=${this.assetsState}
        ?enable-local-assets=${this.enableLocalAssets}
      ></play-assets-dialog>
      <play-export-dialog url=${this.url}></play-export-dialog>
      <play-settings-dialog
        ?allow-storage=${this.allowStorage}
        remote-runtime-origin=${this.remoteRuntimeOrigin}
        ?runtime-debug-logging=${this.runtimeDebugLogging}
        ?sandbox-app=${this.sandboxApp}
        ?use-experimental-blocks=${this.useExperimentalBlocks}
        ?use-ui-request=${this.useUIRequest}
        ?use-speculative-execution=${this.useSpeculativeExecution}
        ?use-local-runtime=${this.useLocalRuntime}
        ?use-remote-runtime=${this.useRemoteRuntime}
        ?enable-local-assets=${this.enableLocalAssets}
      ></play-settings-dialog>
    `
  }
}
