import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {defaultSettings} from '../storage/settings-save.js'
import {Bubble} from '../utils/bubble.js'
import {PlayDialog, type PlayDialogLike} from './play-dialog/play-dialog.js'
import {cssReset} from '../utils/css-reset.js'

import './play-button.js'
import './play-dialog/play-dialog.js'

declare global {
  interface HTMLElementEventMap {
    'edit-remote-runtime-origin': CustomEvent<string>
    'runtime-debug-logging': CustomEvent<boolean>
    'sandbox-app': CustomEvent<boolean>
    'use-experimental-blocks': CustomEvent<boolean>
    'use-local-runtime': CustomEvent<boolean>
    'use-remote-runtime': CustomEvent<boolean>
    'use-ui-request': CustomEvent<boolean>
    'use-speculative-execution': CustomEvent<boolean>
    'enable-local-assets': CustomEvent<boolean>
  }
  interface HTMLElementTagNameMap {
    'play-settings-dialog': PlaySettingsDialog
  }
}

@customElement('play-settings-dialog')
export class PlaySettingsDialog extends LitElement implements PlayDialogLike {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    legend {
      font-weight: bold;
    }

    input[type='checkbox'] {
      float: left;
      margin-inline-end: var(--space);
    }

    input[type='text'] {
      display: block;
      width: 100%;
    }

    label {
      cursor: pointer; /* Finger. */
      display: block; /* Each control starts a new block. */
      margin-bottom: var(--space);
    }
  `

  @property({attribute: 'allow-storage', type: Boolean}) allowStorage: boolean =
    false
  @property({attribute: 'remote-runtime-origin'}) remoteRuntimeOrigin: string =
    defaultSettings.remoteRuntimeOrigin
  @property({attribute: 'runtime-debug-logging', type: Boolean})
  runtimeDebugLogging: boolean = false
  @property({attribute: 'sandbox-app', type: Boolean})
  sandboxApp: boolean = false
  @property({attribute: 'use-experimental-blocks', type: Boolean})
  useExperimentalBlocks: boolean = false
  @property({attribute: 'use-local-runtime', type: Boolean})
  useLocalRuntime: boolean = false
  @property({attribute: 'use-remote-runtime', type: Boolean})
  useRemoteRuntime: boolean = false
  @property({attribute: 'use-speculative-execution', type: Boolean})
  useSpeculativeExecution: boolean = false
  @property({attribute: 'use-ui-request', type: Boolean})
  useUIRequest: boolean = false
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
    const description = `Settings are ${this.allowStorage ? 'saved and ' : ''}not shareable.`
    return html`
      <play-dialog dialog-title="Settings" description="${description}">
        <fieldset>
          <legend>Reddit Internal</legend>
          <p>Runtime settings take effect on subsequent execution.</p>
          <label>
            <input
              ?checked="${this.useLocalRuntime}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>('use-local-runtime', ev.currentTarget.checked)
                )}
            />
            Use local runtime. Execute apps locally whenever possible. Default:
            ${onOff(defaultSettings.useLocalRuntime)}.
          </label>
          <label>
            <input
              ?checked="${this.sandboxApp}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>('sandbox-app', ev.currentTarget.checked)
                )}
            />
            Sandbox app execution. Sandboxing is slower but may be more
            production-like. Default: ${onOff(defaultSettings.sandboxApp)}.
          </label>
          <label>
            <input
              ?checked="${this.runtimeDebugLogging}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>(
                    'runtime-debug-logging',
                    ev.currentTarget.checked
                  )
                )}
            />
            Enable runtime debug logging. May also require enabling verbose
            DevTools console logs. Default:
            ${onOff(defaultSettings.runtimeDebugLogging)}.
          </label>
          <label>
            <input
              ?checked="${this.useRemoteRuntime}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>(
                    'use-remote-runtime',
                    ev.currentTarget.checked
                  )
                )}
            />
            Use remote runtime. Upload on every change and execute apps remotely
            as needed. Default: ${onOff(defaultSettings.useRemoteRuntime)}.
          </label>
          <label>
            <input
              type="text"
              value="${this.remoteRuntimeOrigin}"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<string>(
                    'edit-remote-runtime-origin',
                    ev.currentTarget.value
                  )
                )}
            />
            Remote runtime origin. Destination for app uploads and remote
            execution. Default: ${defaultSettings.remoteRuntimeOrigin}.
          </label>
          <label>
            <input
              ?checked="${this.useExperimentalBlocks}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>(
                    'use-experimental-blocks',
                    ev.currentTarget.checked
                  )
                )}
            />
            Use experimental blocks. Default:
            ${onOff(defaultSettings.useExperimentalBlocks)}.
          </label>
          <label>
            <input
              ?checked="${this.useUIRequest}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>('use-ui-request', ev.currentTarget.checked)
                )}
            />
            Use UI Request (multithreading). Default:
            ${onOff(defaultSettings.useUIRequest)}.
          </label>
          <label>
            <input
              ?checked="${this.useSpeculativeExecution}"
              type="checkbox"
              @change=${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>(
                    'use-speculative-execution',
                    ev.currentTarget.checked
                  )
                )}
            />
            Use speculative execution (only valid when UI request is enabled).
            Default: ${onOff(defaultSettings.useSpeculativeExecution)}.
          </label>
          <label>
            <input
              ?checked="${this.enableLocalAssets}"
              type="checkbox"
              @change="${(ev: Event & {currentTarget: HTMLInputElement}) =>
                this.dispatchEvent(
                  Bubble<boolean>(
                    'enable-local-assets',
                    ev.currentTarget.checked
                  )
                )}"
            />
            Enable experimental local filesystem assets. Default:
            ${onOff(defaultSettings.enableLocalAssets)}
          </label>
        </fieldset>
      </play-dialog>
    `
  }
}

/** Translate a boolean to on / off. */
function onOff(on: boolean): string {
  return on ? 'on' : 'off'
}
