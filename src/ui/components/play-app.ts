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
    console.log(`play v${globalThis.play.version}`)
  }

  protected override render() {
    return html`
      <play-pen allow-storage allow-url>
        <script lang="tsx" type="application/devvit">
          import {Devvit} from '@devvit/public-api'

          Devvit.addCustomPostType({
            name: 'Say Hello',
            render: ctx => {
              const [counter, setCounter] = ctx.useState(0)
              return (
                <vstack alignment='center middle' height={100}>
                  <hstack alignment='center middle' gap='medium' padding='medium'>
                    <text size='xxlarge' style='heading'>
                      Hello! 👋
                    </text>
                    <button
                      appearance='primary'
                      onPress={() => setCounter(counter => counter + 1)}
                    >
                      Click me!
                    </button>
                  </hstack>
                  {counter ? (
                    <text>{\`You clicked \${counter} time(s)!\`}</text>
                  ) : (
                    <text>&nbsp;</text>
                  )}
                </vstack>
              )
            }
          })

          export default Devvit
        </script>
      </play-pen>
    `
  }
}
