import {LitElement, css, html} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-dropdown-menu': PlayDropdownMenu
  }
}

/**
 * @slot menu - Menu list items. to-do: extract menu component instead of
 *              assuming li.
 * @slot trigger - Button. to-do: use a button.
 */
@customElement('play-dropdown-menu')
export class PlayDropdownMenu extends LitElement {
  @property({type: String}) direction?: 'down' | 'up' = 'up'
  @state() private isOpen = false

  static override styles = css`
    :host ol {
      position: absolute;
      right: 0;
      background-color: var(--color-neutral-background);
      border-radius: 8px;
      box-shadow:
        0px 4px 8px 0px var(--color-shade-10),
        0px 6px 12px 0px var(--color-shade-25);
      display: flex;
      flex-direction: column;
      margin: 0;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 0;
      list-style: none;
      height: min-content;
    }

    :host([direction='up']) ol {
      top: 8px;
      transform: translateY(-100%);
    }

    :host([direction='down']) ol {
      bottom: 8px;
      transform: translateY(100%);
    }

    :host .menu {
      visibility: hidden;
      opacity: 0;
    }

    :host .menu.open {
      visibility: visible;
      opacity: 1;
      transition-duration: 0.1s;
      transition-property: opacity;
      transition-timing-function: ease-out;
    }

    :host([direction='up']) .open ol {
      top: -8px;
      transition-duration: 0.1s;
      transition-property: top;
      transition-timing-function: ease-out;
    }

    :host([direction='down']) .open ol {
      bottom: -8px;
      transition-duration: 0.1s;
      transition-property: bottom;
      transition-timing-function: ease-out;
    }

    :host {
      position: relative;
    }

    :host .scrim {
      position: fixed;
      inset: 0;
      display: none;
    }

    :host .open .scrim {
      display: block;
    }
  `

  #toggleMenu() {
    this.isOpen = !this.isOpen
  }

  #closeMenu() {
    this.isOpen = false
  }

  protected override render() {
    return html` <div @click=${this.#toggleMenu}>
        <slot name="trigger"></slot>
      </div>
      <div class="menu ${this.isOpen ? 'open' : ''}">
        <div class="scrim" @click=${this.#closeMenu}></div>
        <ol @click=${this.#closeMenu}>
          <slot name="menu"></slot>
        </ol>
      </div>`
  }
}
