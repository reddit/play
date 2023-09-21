import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Bubble} from '../bubble.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-resizable-text-input': PlayResizableTextInput
  }
}

@customElement('play-resizable-text-input')
export class PlayResizableTextInput extends LitElement {
  static override styles = css`
    input {
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

    input::placeholder {
      color: var(--rpl-neutral-content-weak);
    }

    input:focus {
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--rpl-brand-background);
    }

    input:hover {
      background-color: var(--rpl-secondary-background);
    }

    input::selection {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background);
    }
  `

  @property({attribute: false, type: String}) text: string = ''
  @property({type: String}) placeholder: string = ''

  protected override render() {
    return html`<input
      @input=${this.#onInput}
      type="text"
      placeholder=${this.placeholder}
      value=${this.text}
    />`
  }

  protected override updated(): void {
    this.#resizeInput(this.shadowRoot?.querySelector('input')!)
  }

  #onInput(ev: InputEvent & {currentTarget: HTMLInputElement}): void {
    this.dispatchEvent(Bubble('edit-text', ev.currentTarget.value))
  }

  #resizeInput(input: HTMLInputElement): void {
    const span = document.createElement('span')
    span.innerText = this.text || input.placeholder
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
