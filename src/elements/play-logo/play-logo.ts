import {LitElement, css, type CSSResultGroup} from 'lit'
import {customElement} from 'lit/decorators.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import {cssReset} from '../../utils/css-reset.js'
import logo from './logo.svg'

declare global {
  interface HTMLElementTagNameMap {
    'play-logo': PlayLogo
  }
}

@customElement('play-logo')
export class PlayLogo extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

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

  protected override render(): unknown {
    return unsafeHTML(logo)
  }
}
