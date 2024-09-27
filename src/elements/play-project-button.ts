import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'

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

    .project-pen:active {
      background-color: var(--color-secondary-background-active);
    }

    .project-pen:focus {
      outline-color: var(--color-brand-background);
    }
  `
  @property({attribute: false}) srcByLabel?: {readonly [key: string]: string}
  @property() size: SizeOptions = 'medium'

  protected override render(): TemplateResult {
    return html`
      <div class="container">
        <play-dropdown-menu direction="down">
          <div slot="trigger">
            <button class="project-pen" title="Project Options">
              <play-icon
                size=${iconSizes[this.size]}
                icon="download-outline"
              ></play-icon>
              <span>Project</span>
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
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('save-project', {
                    bubbles: true,
                    composed: true
                  })
                )}
            ></play-list-item>
            <play-list-item
              label="Load"
              icon="upload-outline"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('load-project', {
                    bubbles: true,
                    composed: true
                  })
                )}
            ></play-list-item>
            <play-list-item
              label="Export"
              icon="external-outline"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent('open-export-dialog', {
                    bubbles: true,
                    composed: true
                  })
                )}
            ></play-list-item>
          </div>
        </play-dropdown-menu>
      </div>
    `
  }
}
