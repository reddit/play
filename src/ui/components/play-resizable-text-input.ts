import {LitElement, css, html, type PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Bubble} from '../bubble.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-resizable-text-input': PlayResizableTextInput
  }
}

/** @fires {string} edit-text */
@customElement('play-resizable-text-input')
export class PlayResizableTextInput extends LitElement {
  static override styles = css`
    :host {
      position: relative;
      width: 100%;
      flex-shrink: 1;
      font-family: inherit;
      font-size: 24px;
      font-style: normal;
      font-weight: 400;
      line-height: 28px;
    }

    .label {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
      text-overflow: ellipsis;
      white-space: pre;
      overflow-x: clip;
    }

    input {
      font: inherit;
      line-height: inherit;
      margin: 0;
      color: transparent;
      background-color: transparent;
      border: none;
      border-radius: 4px;
      caret-color: var(--color-brand-background);
    }

    input,
    .label {
      width: 100%;
      padding-top: 2px;
      padding-right: 8px;
      padding-bottom: 2px;
      padding-left: 8px;
    }

    input::placeholder {
      color: var(--color-neutral-content-weak);
    }

    input:focus,
    input:focus:hover {
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--color-brand-background);
      color: var(--color-secondary-plain);
    }

    input:focus + .label {
      display: none;
    }

    input:hover {
      outline-width: 1px;
      outline-style: solid;
      outline-color: var(--color-neutral-border);
    }

    input::selection {
      color: var(--color-brand-foreground);
      background-color: var(--color-brand-background);
    }
  `

  @property({attribute: false}) text: string = ''
  @property() placeholder: string = ''

  protected override render() {
    return html`
      <div>
        <input
          type="text"
          placeholder=${this.placeholder}
          .value=${this.text}
          @input=${this.#onInput}
        />
        <div class="label" aria-hidden="true">${this.text}</div>
      </div>
    `
  }

  protected override updated(props: PropertyValues<this>): void {
    super.updated(props)
    this.#resizeInput(this.shadowRoot?.querySelector('input')!)
  }

  #onInput(ev: InputEvent & {currentTarget: HTMLInputElement}): void {
    this.dispatchEvent(Bubble('edit-text', ev.currentTarget.value))
  }

  #resizeInput(input: HTMLInputElement): void {
    const span = globalThis.document.createElement('span')
    span.innerText = this.text || this.placeholder
    span.style.visibility = 'hidden'
    span.style.whiteSpace = 'pre'
    span.style.fontFamily = 'inherit'
    span.style.fontSize = '24px'
    span.style.fontStyle = 'normal'
    span.style.fontWeight = '400'
    globalThis.document.body.appendChild(span)
    input.style.maxWidth = `${span.offsetWidth}px`
    globalThis.document.body.removeChild(span)
  }
}
