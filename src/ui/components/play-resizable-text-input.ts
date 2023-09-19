import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-resizable-text-input': PlayResizableTextInput
  }
}

@customElement('play-resizable-text-input')
export class PlayResizableTextInput extends LitElement {
  static override styles = css`
    input[type='text'] {
      margin: 0;
      padding-top: 2px;
      padding-right: 8px;
      padding-bottom: 2px;
      padding-left: 8px;
      color: var(--rpl-neutral-content-strong);
      font-family: inherit;
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      line-height: 28px;
      background-color: var(--rpl-neutral-background);
      border: none;
      border-radius: 4px;
      caret-color: var(--rpl-brand-background);
    }

    input[type='text']::placeholder {
      color: var(--rpl-neutral-content-weak);
    }

    input[type='text']:focus {
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--rpl-brand-background);
    }

    input[type='text']:hover {
      background-color: var(--rpl-secondary-background);
    }

    input[type='text']::selection {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background);
    }
  `

  override updated(): void {
    this.resizeInput()
  }

  private resizeInput(): void {
    const input = this.shadowRoot?.querySelector('input')
    if (input) {
      const span = document.createElement('span')
      const text = input.value.length > 0 ? input.value : 'Untitled playground'
      span.innerText = text
      span.style.visibility = 'hidden'
      span.style.whiteSpace = 'pre'
      span.style.fontFamily = 'inherit'
      span.style.fontSize = '24px'
      span.style.fontStyle = 'normal'
      span.style.fontWeight = '400'
      document.body.appendChild(span)
      input.style.width = `${span.offsetWidth}px`
      document.body.removeChild(span)
    }
  }

  handleChange(): void {
    this.resizeInput()
  }

  override render() {
    return html`<input
      type="text"
      placeholder="Untitled playground"
      @input=${this.handleChange}
    />`
  }
}
