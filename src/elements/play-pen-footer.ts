import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {Diagnostics} from '../types/diagnostics.js'
import {openURL} from '../utils/open-url.js'

import {cssReset} from '../utils/css-reset.js'
import './play-button.js'
import './play-console.js'
import './play-dropdown-menu.js'
import './play-list-item.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-footer': PlayPenFooter
  }
}

@customElement('play-pen-footer')
export class PlayPenFooter extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    footer {
      background-color: var(--color-neutral-content-weak);
    }

    .footer-buttons {
      display: flex;
      flex-direction: row;
      column-gap: 16px;
      justify-content: space-between;
      padding-top: 0px;
      padding-right: 16px;
      padding-bottom: 0px;
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

  @property({attribute: false}) diagnostics?: Readonly<Diagnostics>
  @state() private _open?: boolean

  protected override render(): TemplateResult {
    const errsLen =
      (this.diagnostics?.previewErrs.length ?? 0) +
      (this.diagnostics?.tsErrs.length ?? 0)
    return html`
      <footer>
        <div class="footer-buttons">
          <play-button
            appearance="inverted"
            size="small"
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
                  size="small"
                  icon="overflow-horizontal-outline"
                  title="Additional options"
                ></play-button>
              </div>
              <div slot="menu">
                <play-list-item
                  icon="report-outline"
                  label="Report a bug"
                  @click=${() =>
                    openURL(
                      'https://discord.com/channels/1050224141732687912/1115441897079574620'
                    )}
                ></play-list-item>
                <play-list-item
                  icon="community-outline"
                  label="Devvit community"
                  @click=${() => openURL('https://www.reddit.com/r/devvit')}
                ></play-list-item>
              </div>
            </play-dropdown-menu>
          </div>
        </div>
        <div class=${`console-container ${this._open ? 'open' : 'closed'}`}>
          ${this._open
            ? html`
                <play-console .diagnostics=${this.diagnostics}></play-console>
              `
            : nothing}
        </div>
      </footer>
    `
  }
}
