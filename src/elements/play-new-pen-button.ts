import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js'
import {Bubble} from '../utils/bubble.js'
import {openURL} from '../utils/open-url.js'

import {cssReset} from '../utils/css-reset.js'
import './play-dropdown-menu.js'
import './play-icon/play-icon.js'
import './play-list-item.js'

export type SizeOptions = 'small' | 'medium'
const iconSizes: {[key in SizeOptions]: string} = {
  small: '16px',
  medium: '20px'
}

declare global {
  interface HTMLElementEventMap {
    'edit-src': CustomEvent<string>
  }
  interface HTMLElementTagNameMap {
    'play-new-pen-button': PlayNewPenButton
  }
}

@customElement('play-new-pen-button')
export class PlayNewPenButton extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    .container {
      display: flex;
      flex-direction: row;
      column-gap: 0;
      justify-content: space-between;
      align-items: center;
      box-shadow: inset 0px 0px 0px var(--border-width)
        var(--color-secondary-border);
      border-radius: var(--radius-full);
    }

    button {
      font-family: var(--font-family-sans);
      color: var(--color-secondary-plain);
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    :host([size='small']) button {
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: -0.1px;
    }

    :host([size='medium']) button {
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: -0.3px;
    }

    .new-pen {
      display: flex;
      flex-direction: row;
    }

    :host([size='small']) .new-pen {
      column-gap: 8px;
      padding-top: 8px;
      padding-right: 8px;
      padding-bottom: 8px;
      padding-left: 12px;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
    }

    :host([size='medium']) .new-pen {
      column-gap: 8px;
      padding-top: 10px;
      padding-right: 12px;
      padding-bottom: 10px;
      padding-left: 16px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }

    :host([size='small']) .new-from-template {
      padding-top: 8px;
      padding-right: 8px;
      padding-bottom: 8px;
      padding-left: 8px;
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
    }

    :host([size='medium']) .new-from-template {
      padding-top: 10px;
      padding-right: 10px;
      padding-bottom: 10px;
      padding-left: 8px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }

    .new-pen:hover,
    .new-from-template:hover {
      background-color: var(--color-secondary-background-hovered);
    }

    .new-pen:active,
    .new-from-template:active {
      background-color: var(--color-secondary-background-active);
    }

    .new-pen:focus,
    .new-from-template:focus {
      outline-color: var(--color-brand-background);
    }

    .divider {
      width: 1px;
      background-color: var(--color-secondary-background-decor);
    }

    :host([size='small']) .divider {
      height: 16px;
    }

    :host([size='medium']) .divider {
      height: 20px;
    }
  `

  @property({attribute: false}) srcByLabel?: Readonly<{[key: string]: string}>
  @property() size: SizeOptions = 'medium'

  protected override render(): TemplateResult {
    return html`
      <div class="container">
        <button
          class="new-pen"
          @click=${() =>
            this.dispatchEvent(
              Bubble<string>('edit-src', this.srcByLabel?.Default || '')
            )}
          title="New pen"
        >
          <play-icon
            size=${iconSizes[this.size]}
            icon="add-outline"
          ></play-icon>
          <span>New</span>
        </button>
        <div class="divider"></div>
        <play-dropdown-menu direction="down">
          <div slot="trigger">
            <button class="new-from-template" title="New pen from template">
              <play-icon
                size=${iconSizes[this.size]}
                icon="caret-down-outline"
              ></play-icon>
            </button>
          </div>
          <div slot="menu">
            ${repeat(
              Object.entries(this.srcByLabel ?? {}),
              ([label]) => label,
              ([label, src]) => html`
                <play-list-item
                  label=${label}
                  @click=${() => {
                    this.dispatchEvent(Bubble<string>('edit-src', src))
                  }}
                  >${label}</play-list-item
                >
              `
            )}
            <play-list-item
              label="More examples"
              endIcon="external-outline"
              @click=${() =>
                openURL('https://developers.reddit.com/docs/playground')}
            ></play-list-item>
          </div>
        </play-dropdown-menu>
      </div>
    `
  }
}
