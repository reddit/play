import {consume} from '@lit-labs/context'
import {LitElement, css, html, nothing} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import type {Diagnostics} from '../../types/diagnostics.js'
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
      background-color: var(--rpl-secondary-background);
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

    .badge {
      color: var(--rpl-neutral-content-strong);
      border-radius: 8px;
      background-color: var(--rpl-neutral-background);
      min-width: 24px;
    }
  `

  @consume({context: penCtx.scheme, subscribe: true})
  @property({attribute: false})
  scheme: ColorScheme | undefined

  @consume({context: penCtx.desktop, subscribe: true})
  @property({attribute: false})
  desktop: boolean = false

  @consume({context: penCtx.diagnostics, subscribe: true})
  @property({attribute: false})
  diagnostics?: Diagnostics

  @state() private _open = false

  protected override render() {
    const errs = this.diagnostics?.previewErrs.length
      ? html`<span class="badge">${this.diagnostics?.previewErrs.length}</span>`
      : nothing
    return html`<footer>
      <div class="buttons">
        <play-button
          appearance="secondary"
          endIcon="${this._open ? 'caret-down-outline' : 'caret-up-outline'}"
          title="Toggle Console"
          @click=${() => (this._open = !this._open)}
          >Console${errs}</play-button
        >
        <div class="actions">
          <play-button
            appearance="secondary"
            endIcon="caret-down-outline"
            title="Toggle Device"
            @click=${() =>
              this.dispatchEvent(
                Bubble('play-pen-set-desktop', this.desktop ? false : true)
              )}
            >${this.desktop ? 'Desktop' : 'Mobile'}</play-button
          >
          <play-button
            appearance="secondary"
            icon=${this.#isDark() ? 'night-outline' : 'day-outline'}
            title="Toggle Scheme"
            @click=${() =>
              this.dispatchEvent(
                Bubble('play-pen-set-scheme', this.#isDark() ? 'light' : 'dark')
              )}
          ></play-button>
          <play-button
            appearance="secondary"
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
