import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Bubble} from '../bubble.js'

declare global {
  interface HTMLElementEventMap {
    'fancy-click': CustomEvent<FancyClick>
  }
  interface HTMLElementTagNameMap {
    'play-demo': PlayDemo
  }
}

export type FancyClick = {num: number}

@customElement('play-demo')
export class PlayDemo extends LitElement {
  @property({attribute: false}) example?: string

  static override styles: CSSResultGroup = css``

  protected override render(): TemplateResult {
    return html`<button
      @click=${() => {
        console.log('hello! button clicked!')
        this.dispatchEvent(
          Bubble<FancyClick>('fancy-click', {num: Math.random()})
        )
      }}
    >
      hello!
    </button>`
  }
}
