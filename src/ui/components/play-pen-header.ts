import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {openURL} from '../../utils/open-url.js'
import {Bubble} from '../bubble.js'

import './play-button.js'
import './play-icon.js'
import './play-logo.js'
import './play-new-pen-button.js'
import './play-resizable-text-input.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-header': PlayPenHeader
  }
}

@customElement('play-pen-header')
export class PlayPenHeader extends LitElement {
  static override styles = css`
    header {
      padding-top: 16px;
      padding-right: 16px;
      padding-bottom: 16px;
      padding-left: 16px;
      display: flex;
      flex-direction: row;
      column-gap: 32px;
      justify-content: space-between;
      align-items: center;
      background-color: var(--color-background);
    }

    .titling {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 8px;
      row-gap: 8px;
    }

    play-logo {
      flex-shrink: 0;
    }

    .actions {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      align-items: center;
    }
  `

  @property() name: string = ''
  @property({attribute: false}) srcByLabel?: Readonly<{[key: string]: string}>

  protected override render() {
    return html`<header>
      <div class="titling">
        <play-logo></play-logo>
        <play-resizable-text-input
          @edit-text=${(ev: CustomEvent<string>) =>
            this.dispatchEvent(Bubble('edit-name', ev.detail))}
          placeholder="Untitled pen"
          .text=${this.name}
        ></play-resizable-text-input>
      </div>
      <div class="actions">
        <play-new-pen-button
          .srcByLabel=${this.srcByLabel}
        ></play-new-pen-button
        ><play-button
          appearance="bordered"
          size="medium"
          icon="external-outline"
          title="Open Documentation"
          label="Docs"
          @click=${() => openURL('https://developers.reddit.com/docs')}
        ></play-button>
        <play-button
          @click=${() => this.dispatchEvent(Bubble('share', undefined))}
          appearance="orangered"
          size="medium"
          icon="share-new-outline"
          title="Copy Program to URL"
          label="Share"
        ></play-button>
      </div>
    </header>`
  }
}
