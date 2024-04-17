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

import './play-button.js'

declare global {
  interface HTMLElementEventMap {
    'edit-remote-runtime-origin': CustomEvent<string>
    'runtime-debug-logging': CustomEvent<boolean>
    'sandbox-app': CustomEvent<boolean>
    'use-experimental-blocks': CustomEvent<boolean>
    'use-local-runtime': CustomEvent<boolean>
    'use-remote-runtime': CustomEvent<boolean>
  }
  interface HTMLElementTagNameMap {
    'play-settings-dialog': PlaySettingsDialog
  }
}

@customElement('play-settings-dialog')
export class PlaySettingsDialog extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    dialog {
      color: var(--color-neutral-content);
      background-color: var(--color-neutral-background);
      box-shadow: var(--shadow-m);

      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);

      padding-top: var(--space);
      padding-bottom: var(--space);
      padding-left: var(--space);
      padding-right: var(--space);

      /* No border needed. Dialog background has sufficient contrast against the scrim. */
      border-width: 0;

      /* to-do: breakpoints */
      width: 480px;
      max-width: 90vw;
    }

    dialog::backdrop {
      /* to-do: Update to css variable --color-shade-60 once supported by Chromium and Safari.
      https://bugs.webkit.org/show_bug.cgi?id=263834
      https://bugs.chromium.org/p/chromium/issues/detail?id=827397
      https://stackoverflow.com/a/77393321 */
      background-color: rgba(0, 0, 0, 0.6);
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      row-gap: var(--space);
    }

    h1 {
      color: var(--color-neutral-content-strong);

      /* No margins needed for composition. */
      margin-top: 0;
      margin-bottom: 0;

      /* RPL/Heading Bold/24-HeadingBold */
      font-family: var(--font-family-sans);
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0.2px;
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

    legend {
      font-weight: bold;
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
  @query('dialog') private _dialog!: HTMLDialogElement

  open(): void {
    this._dialog.showModal()
  }

  close(): void {
    this._dialog.close()
  }

  protected override render(): TemplateResult {
    return html`
      <dialog>
        <header>
          <h1>Settings</h1>
          <play-button
            appearance="plain"
            icon="close-outline"
            @click=${this.close}
            size="small"
            title="Close"
          ></play-button>
        </header>

        <p>
          Settings are ${this.allowStorage ? 'saved and ' : ''}not shareable.
        </p>

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
        </fieldset>
      </dialog>
    `
  }
}

/** Translate a boolean to on / off. */
function onOff(on: boolean): string {
  return on ? 'on' : 'off'
}
