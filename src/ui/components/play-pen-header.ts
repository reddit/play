import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'
import './play-button.js'
import './play-icon.js'
import './play-resizable-text-input.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-header': PlayPenHeader
  }
}

@customElement('play-pen-header')
export class PlayPenHeader extends LitElement {
  static override styles = css`
    .wrapper {
      padding: 24px;
      display: flex;
      flex-direction: row;
      gap: 16px;
      justify-content: space-between;
      align-items: center;
    }

    .titling {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background-color: var(--rpl-global-orangered);
      color: var(--rpl-brand-onBackground);
      border-radius: 8px;
      padding: 0;
      flex-shrink: 0;
    }

    .actions {
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
    }
  `

  override render() {
    return html`<div class="wrapper">
      <div class="titling">
        <div class="avatar">
          <play-icon icon="devvit-outline" size="28px"></play-icon>
        </div>
        <play-resizable-text-input></play-resizable-text-input>
      </div>
      <div class="actions">
        <play-button
          appearance="plain"
          label="New"
          icon="add-outline"
        ></play-button>
        <play-button
          appearance="plain"
          label="Docs"
          icon="info-outline"
        ></play-button>
        <play-button
          appearance="brand"
          label="Share"
          icon="share-new-outline"
        ></play-button>
      </div>
    </div>`
  }
}
