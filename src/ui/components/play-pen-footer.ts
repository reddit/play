import {consume} from '@lit-labs/context'
import {LitElement, css, html, nothing} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import {Bubble} from '../bubble.js'
import {penCtx} from './play-pen-context.js'

import './play-button.js'
import './play-console.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-footer': PlayPenFooter
  }
}

@customElement('play-pen-footer')
export class PlayPenFooter extends LitElement {
  static override styles = css`
    footer {
      background-color: var(--rpl-brand-background);
    }
    .buttons {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
      row-gap: 16px;
      justify-content: space-between;
      padding-top: 2px;
      padding-right: 0px;
      padding-bottom: 2px;
      padding-left: 0px;
    }
    .actions {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      row-gap: 8px;
    }
  `

  @consume({context: penCtx.scheme, subscribe: true})
  @property({attribute: false})
  scheme: ColorScheme | undefined

  @consume({context: penCtx.desktop, subscribe: true})
  @property({attribute: false})
  desktop: boolean = false

  @state() private _open = false

  protected override render() {
    return html`<footer>
      <div class="buttons">
        <play-button
          appearance="brand"
          label="Console"
          endIcon="${this._open ? 'caret-down-outline' : 'caret-up-outline'}"
          title="Toggle Console"
          @click=${() => (this._open = !this._open)}
        ></play-button>
        <div class="actions">
          <play-button
            appearance="brand"
            label="${this.desktop ? 'Desktop' : 'Mobile'}"
            endIcon="caret-down-outline"
            title="Toggle Device"
            @click=${() =>
              this.dispatchEvent(
                Bubble('play-pen-set-desktop', this.desktop ? false : true)
              )}
          ></play-button>
          <play-button
            appearance="brand"
            icon="night-outline"
            title="Toggle Scheme"
            @click=${() =>
              this.dispatchEvent(
                Bubble('play-pen-set-scheme', this.#isDark() ? 'light' : 'dark')
              )}
          ></play-button>
          <play-button
            appearance="brand"
            icon="overflow-horizontal-outline"
            title="Additional Options"
            @click=${() => console.log('Show overflow menu')}
          ></play-button>
        </div>
      </div>
      ${this._open ? html`<play-console></play-console>` : nothing}
    </footer>`
  }

  #isDark(): boolean {
    return (
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches ||
      this.scheme === 'dark'
    )
  }
}
