// Portable playground. Imported by ui/assets/index.html and built by
// tools/build.js. Defines play-app component.

import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'

import './play-pen.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-app': PlayApp
  }
}

@customElement('play-app')
export class PlayApp extends LitElement {
  static override styles = css`
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
    console.log(`:play v${globalThis.play.version}`) // #strings:title#
  }

  protected override render() {
    return html`<play-pen allow-storage allow-url>
      <script lang="tsx" type="application/devvit">
        console.log('Hello World!')
      </script>
    </play-pen>`
  }
}
