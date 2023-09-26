import {LitElement, css, html, nothing} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import type {Diagnostics} from '../../types/diagnostics.js'
import {Bubble} from '../bubble.js'

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
      background-color: var(--rpl-neutral-content-weak);
    }
    .buttons {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
      row-gap: 16px;
      justify-content: space-between;
      padding-top: 0;
      padding-right: 24px;
      padding-bottom: 0;
      padding-left: 24px;
    }
    .actions {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
      row-gap: 16px;
    }

    .badge {
      color: var(--rpl-neutral-background);
      border-radius: 9001px;
      background-color: var(--rpl-orangered-500);
      padding-top: 2px;
      padding-right: 8px;
      padding-bottom: 2px;
      padding-left: 8px;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
    }
  `

  @property({type: Boolean}) desktop?: boolean
  @property({attribute: false}) diagnostics?: Readonly<Diagnostics>
  @property() scheme: ColorScheme | undefined

  @state() private _open?: boolean

  protected override render() {
    const errs = this.diagnostics?.previewErrs.length
      ? html`<span class="badge">${this.diagnostics?.previewErrs.length}</span>`
      : nothing
    return html`<footer>
      <div class="buttons">
        <play-button
          appearance="inverted"
          size="medium"
          endIcon="${this._open ? 'caret-down-outline' : 'caret-up-outline'}"
          title="Toggle Console"
          @click=${() => (this._open = !this._open)}
          >Console${errs}</play-button
        >
        <div class="actions">
          <play-button
            appearance="inverted"
            size="medium"
            endIcon="caret-down-outline"
            title="Toggle Device"
            @click=${() =>
              this.dispatchEvent(
                Bubble('preview-desktop', this.desktop ? false : true)
              )}
            >${this.desktop ? 'Desktop' : 'Mobile'}</play-button
          >
          <play-button
            appearance="inverted"
            size="medium"
            icon=${this.#isDark() ? 'night-outline' : 'day-outline'}
            title="Toggle Scheme"
            @click=${() =>
              this.dispatchEvent(
                Bubble('preview-scheme', this.#isDark() ? 'light' : 'dark')
              )}
            >Theme</play-button
          >
          <play-button
            appearance="inverted"
            size="medium"
            icon="overflow-horizontal-outline"
            title="Additional Options"
            @click=${() => console.log('Show overflow menu')}
          ></play-button>
        </div>
      </div>
      ${this._open
        ? html`<play-console .diagnostics=${this.diagnostics}></play-console>`
        : nothing}
    </footer>`
  }

  #isDark(): boolean {
    return (
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches ||
      this.scheme === 'dark'
    )
  }
}
