import {LitElement, css, html, nothing} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import type {Diagnostics} from '../../types/diagnostics.js'
import {Bubble} from '../bubble.js'

import './play-button.js'
import './play-console.js'
import './play-dropdown-menu.js'
import './play-list-item.js'

/* Available preview sizes */
const sizes: readonly [width: number, label: string][] = [
  [288, '288 - Mobile small'],
  [343, '343 - Mobile'],
  [400, '400 - Mobile large'],
  [512, '512 - Desktop Small'],
  [718, '718 - Desktop Large']
]

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-footer': PlayPenFooter
  }
}

@customElement('play-pen-footer')
export class PlayPenFooter extends LitElement {
  static override styles = css`
    footer {
      background-color: var(--color-neutral-content-weak);
    }

    .footer-buttons {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
      justify-content: space-between;
      padding-top: 0;
      padding-right: 16px;
      padding-bottom: 0;
      padding-left: 16px;
    }

    .actions {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
    }

    .console-container {
      height: 0;
      overflow: hidden;
      transition-duration: 0.1s;
      transition-property: height;
      transition-timing-function: ease-out;
      background-color: var(--color-background);
    }
    .console-container.open {
      height: 320px;
    }
  `

  @property({type: Number}) previewWidth = 718
  @property({attribute: false}) diagnostics?: Readonly<Diagnostics>
  @property() scheme: ColorScheme | undefined

  @state() private _open?: boolean

  protected override render() {
    const errsLen =
      (this.diagnostics?.previewErrs.length ?? 0) +
      (this.diagnostics?.tsErrs.length ?? 0)
    return html`<footer>
      <div class="footer-buttons">
        <play-button
          appearance="inverted"
          size="medium"
          endIcon="${this._open ? 'caret-down-outline' : 'caret-up-outline'}"
          title="Toggle console"
          @click=${() => (this._open = !this._open)}
          badge=${errsLen}
          label="Console"
        ></play-button>
        <div class="actions">
          <play-dropdown-menu direction="up">
            <div slot="trigger">
              <play-button
                appearance="inverted"
                size="medium"
                icon="resize-horizontal-outline"
                title="Select preview width"
                label=${`${this.previewWidth} wide`}
              ></play-button>
            </div>
            <div slot="menu">
              ${sizes.map(
                ([value, label]) =>
                  html` <play-list-item
                    label=${label}
                    @click=${() =>
                      this.dispatchEvent(Bubble('preview-width', value))}
                  ></play-list-item>`
              )}
            </div>
          </play-dropdown-menu>

          <play-button
            appearance="inverted"
            size="medium"
            icon=${this.#isDark() ? 'night-outline' : 'day-outline'}
            title="Toggle the theme"
            label="Theme"
            @click=${() =>
              this.dispatchEvent(
                Bubble('preview-scheme', this.#isDark() ? 'light' : 'dark')
              )}
          ></play-button>

          <play-dropdown-menu direction="up">
            <div slot="trigger">
              <play-button
                appearance="inverted"
                size="medium"
                icon="overflow-horizontal-outline"
                title="Additional options"
              ></play-button>
            </div>
            <div slot="menu">
              <play-list-item
                icon="report-outline"
                label="Report a bug"
              ></play-list-item>
              <play-list-item
                icon="community-outline"
                label="Devvit community"
              ></play-list-item>
            </div>
          </play-dropdown-menu>
        </div>
      </div>
      <div class=${`console-container ${this._open ? 'open' : 'closed'}`}>
        ${this._open
          ? html`<play-console .diagnostics=${this.diagnostics}></play-console>`
          : nothing}
      </div>
    </footer>`
  }

  #isDark(): boolean {
    return (
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches ||
      this.scheme === 'dark'
    )
  }
}
