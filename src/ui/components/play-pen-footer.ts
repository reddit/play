import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'
import {Bubble} from '../bubble.js'
import './play-button.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-footer': PlayPenFooter
  }
}

@customElement('play-pen-footer')
export class PlayPenFooter extends LitElement {
  static override styles = css`
    footer {
      display: flex;
      flex-direction: row;
      gap: 16px;
      justify-content: space-between;
      background-color: var(--rpl-brand-background);
      padding-top: 2px;
      padding-right: 0px;
      padding-bottom: 2px;
      padding-left: 0px;
    }
    .actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }
  `

  protected override render() {
    return html`<footer>
      <play-button
        appearance="brand"
        label="Console"
        endIcon="caret-up-outline"
        title="Toggle Console"
        @click=${() => console.log('Toggle the console')}
      ></play-button>
      <div class="actions">
        <play-button
          appearance="brand"
          label="Mobile"
          endIcon="caret-down-outline"
          title="Toggle Device Options"
          @click=${() => console.log('Show devices/sizes menu')}
        ></play-button>
        <play-button
          appearance="brand"
          icon="night-outline"
          title="Toggle Scheme"
          @click=${() => this.dispatchEvent(Bubble('toggle-scheme', undefined))}
        ></play-button>
        <play-button
          appearance="brand"
          icon="overflow-horizontal-outline"
          title="Additional Options"
          @click=${() => console.log('Show overflow menu')}
        ></play-button>
      </div>
    </footer>`
  }
}
