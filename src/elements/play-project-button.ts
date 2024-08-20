import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Bubble} from '../utils/bubble.js'

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
    'play-project-button': PlayProjectButton
  }
}

@customElement('play-project-button')
export class PlayProjectButton extends LitElement {
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

    .project-pen {
      display: flex;
      flex-direction: row;
    }

    :host([size='small']) .project-pen {
      column-gap: 8px;
      padding-top: 8px;
      padding-right: 8px;
      padding-bottom: 8px;
      padding-left: 12px;
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
    }

    :host([size='medium']) .project-pen {
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

    :host([size='medium']) .project-options {
      padding-top: 10px;
      padding-right: 10px;
      padding-bottom: 10px;
      padding-left: 8px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }

    .project-options:hover,
    .project-template:hover {
      background-color: var(--color-secondary-background-hovered);
    }

    .project-pen:active,
    .project-options:active {
      background-color: var(--color-secondary-background-active);
    }

    .project-pen:focus,
    .project-options:focus {
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

  @property({attribute: false}) srcByLabel?: {readonly [key: string]: string}
  @property() size: SizeOptions = 'medium'

  protected override render(): TemplateResult {
    return html`
      <div class="container">
        <button
          class="project-pen"
          @click=${() =>
            this.dispatchEvent(
              Bubble<string>('edit-src', this.srcByLabel?.Default || '')
            )}
          title="Project Pen"
        >
          <play-icon
            size=${iconSizes[this.size]}
            icon="download-outline"
          ></play-icon>
          <span>Project</span>
        </button>
        <div class="divider"></div>
        <play-dropdown-menu direction="down">
          <div slot="trigger">
            <button class="project-options" title="Project Options">
              <play-icon
                size=${iconSizes[this.size]}
                icon="caret-down-outline"
              ></play-icon>
            </button>
          </div>
          <div slot="menu">
            <play-list-item
              label="Save"
              icon="download-outline"
            ></play-list-item>
            <play-list-item
              label="Export"
              icon="external-outline"
            ></play-list-item>
          </div>
        </play-dropdown-menu>
      </div>
    `
  }
}
