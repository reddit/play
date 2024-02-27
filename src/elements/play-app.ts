import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement} from 'lit/decorators.js'

import './play-pen/play-pen.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-app': PlayApp
  }
}

@customElement('play-app')
export class PlayApp extends LitElement {
  static override styles: CSSResultGroup = css`
    :host {
      /* Allow height to be specified. */
      display: block;

      /* Fill the viewport. */
      height: 100vh;
      width: 100vw;
    }
  `

  constructor() {
    super()
    console.log(
      `:play v${globalThis.version} with Devvit v${globalThis.devvitVersion}`
    )
  }

  protected override render(): TemplateResult {
    return html`
      <play-pen allow-storage allow-url>
        <script lang="tsx" type="application/devvit">
          console.log('Hello World!')
        </script>
      </play-pen>
    `
  }
}
