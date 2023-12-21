import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import './play-icon.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-toast': PlayToast
  }
}

/** @slot - Toast content. */
@customElement('play-toast')
export class PlayToast extends LitElement {
  static override styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      row-gap: var(--space);
      align-items: center;
      visibility: hidden;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: var(--color-neutral-content-strong);
      color: var(--color-neutral-background);
      padding-left: var(--space);
      padding-right: var(--space);
      padding-bottom: var(--space);
      padding-top: var(--space);
      border-radius: var(--radius-large);
      z-index: var(--z-toast);
      box-shadow: var(--shadow-s);
      user-select: none;

      /* These are the initial opacity and margin values before we animate */
      opacity: 0;
      margin-top: var(--space);
      transition-property: margin opacity;
      transition-duration: 0.1s;
      transition-timing-function: ease-out;

      /* RPL/Body Regular/14-BodyReg */
      font-family: var(--font-family-sans);
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: -0.2px;
    }

    :host([opened]) {
      visibility: visible;
      opacity: 1;
      margin-top: 0;
    }
  `

  @property({reflect: true, type: Boolean}) opened = false
  #timeout: ReturnType<typeof setTimeout> | undefined

  open(): void {
    if (this.#timeout != null) clearTimeout(this.#timeout)
    this.opened = true
    this.#timeout = setTimeout(() => {
      this.opened = false
      this.#timeout = undefined
    }, 2000)
  }

  protected override render(): TemplateResult {
    return html`
      <play-icon size="24px" icon="checkmark-fill"></play-icon><slot></slot>
    `
  }
}
