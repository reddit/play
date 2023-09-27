import {LitElement, css} from 'lit'
import {customElement} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import logo from '../assets/logo.svg'

declare global {
  interface HTMLElementTagNameMap {
    'play-logo': PlayLogo
  }
}

@customElement('play-logo')
export class PlayLogo extends LitElement {
  static override styles = css`
    svg {
      display: block;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 40px;
    }
  `

  constructor() {
    super()
    this.addEventListener('click', () => console.log('Quack!'))
  }

  protected override render() {
    return unsafeHTML(logo)
  }
}
