import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-toast': PlayToast
  }
}

/** @slot - Toast content. */
@customElement('play-toast')
export class PlayToast extends LitElement {
  static override styles = css`
    :host {
      visibility: hidden;
      opacity: 0;
      position: fixed;
      bottom: var(--space);
      left: 50%;
      transform: translateX(-50%);
      transition-property: opacity;
      transition-duration: 0.1s;
      transition-timing-function: ease-in-out;
      background-color: var(--color-secondary-background);
      padding-left: var(--space);
      padding-right: var(--space);
      padding-bottom: var(--space);
      padding-top: var(--space);
      border-radius: var(--radius);
    }

    :host([opened]) {
      visibility: visible;
      opacity: 1;
    }
  `

  @property({reflect: true, type: Boolean}) opened = false
  #timeout: ReturnType<typeof setTimeout> | undefined

  open(): void {
    if (this.#timeout != null) globalThis.clearTimeout(this.#timeout)
    this.opened = true
    this.#timeout = globalThis.setTimeout(() => {
      this.opened = false
      this.#timeout = undefined
    }, 3000)
  }

  protected override render() {
    return html`<slot></slot>`
  }
}
