import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js'
import {Bubble} from '../bubble.js'

import './play-button.js'
import './play-icon.js'
import './play-resizable-text-input.js'
import './play-dropdown-menu.js'
import './play-list-item.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-new-pen-button': PlayNewPenButton
  }
}

@customElement('play-new-pen-button')
export class PlayNewPenButton extends LitElement {
  static override styles = css`
    .container {
      display: flex;
      flex-direction: row;
      column-gap: 0;
      justify-content: space-between;
      align-items: center;
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.2);
      border-radius: 9001px;
    }

    button {
      font: inherit;
      background-color: transparent;
      border: none;
      cursor: pointer;
    }

    .new-pen {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      padding-top: 10px;
      padding-right: 12px;
      padding-bottom: 10px;
      padding-left: 16px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }

    .new-from-template {
      padding-top: 10px;
      padding-right: 10px;
      padding-bottom: 10px;
      padding-left: 8px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }

    .new-pen:hover,
    .new-from-template:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .new-pen:active,
    .new-from-template:active {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .new-pen:focus,
    .new-from-template:focus {
      outline-color: var(--color-brand-background);
    }

    .divider {
      width: 1px;
      height: 20px;
      background-color: rgba(0, 0, 0, 0.2);
    }
  `

  @property({attribute: false}) name: string = ''
  @property({attribute: false}) srcByLabel?: Readonly<{[key: string]: string}>

  protected override render() {
    return html`<div class="container">
      <button
        class="new-pen"
        @click=${() => this.dispatchEvent(Bubble('new', undefined))}
        title="New pen"
      >
        <play-icon size="20px" icon="add-outline"></play-icon>
        <span>New</span>
      </button>
      <div class="divider"></div>
      <play-dropdown-menu direction="down">
        <div slot="trigger">
          <button class="new-from-template" title="New pen from template">
            <play-icon size="20px" icon="caret-down-outline"></play-icon>
          </button>
        </div>
        <div slot="menu">
          ${repeat(
            Object.entries(this.srcByLabel ?? {}),
            ([label]) => label,
            ([label, src]) =>
              html`<play-list-item
                label=${label}
                @click=${() => {
                  this.dispatchEvent(Bubble('edit-src', src))
                }}
                >${label}</play-list-item
              >`
          )}
        </div>
      </play-dropdown-menu>
    </div>`
  }
}
