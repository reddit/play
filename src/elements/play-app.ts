import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement} from 'lit/decorators.js'

import {cssReset} from '../utils/css-reset.js'
import './play-pen/play-pen.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-app': PlayApp
  }
}

@customElement('play-app')
export class PlayApp extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

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
      `:play v${globalThis.playVersion} with Devvit v${globalThis.devvitVersion}`
    )
  }

  protected override render(): TemplateResult {
    return html`
      <play-pen allow-storage allow-url>
        <div slot="account-button">
          <play-button appearance="orangered" size="small" icon="share-new-outline" label="LOL"></play-button>
        </div>

        <script lang="tsx" type="application/devvit">
          console.log('Hello World!')
        </script>
      </play-pen>
    `
  }
}
