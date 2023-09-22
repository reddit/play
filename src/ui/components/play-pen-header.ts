import {consume} from '@lit-labs/context'
import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Bubble} from '../bubble.js'
import {penCtx} from './play-pen-context.js'

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
      column-gap: 16px;
      row-gap: 16px;
      justify-content: space-between;
      align-items: center;
    }

    .name {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      column-gap: 8px;
      row-gap: 8px;
    }

    .logo {
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
      column-gap: 8px;
      row-gap: 8px;
      align-items: center;
    }
  `

  @consume({context: penCtx.name, subscribe: true})
  @property({attribute: false})
  name: string = ''

  protected override render() {
    return html`<div class="wrapper">
      <div class="name">
        <div class="logo">
          <play-icon icon="devvit-outline" size="28px"></play-icon>
        </div>
        <play-resizable-text-input
          @edit-text=${(ev: CustomEvent<string>) =>
            this.dispatchEvent(Bubble('play-pen-set-name', ev.detail))}
          placeholder="Untitled pen"
          .text=${this.name}
        ></play-resizable-text-input>
      </div>
      <div class="actions">
        <play-button
          @click=${() => this.dispatchEvent(Bubble('new', undefined))}
          appearance="plain"
          icon="add-outline"
          title="Reset Program Template"
          >New</play-button
        >
        <play-button
          @click=${() =>
            globalThis.open(
              'https://developers.reddit.com/docs',
              '_blank',
              'noopener,noreferrer'
            )}
          appearance="plain"
          icon="info-outline"
          title="Open Documentation"
          >Docs</play-button
        >
        <play-button
          @click=${() => this.dispatchEvent(Bubble('share', undefined))}
          appearance="brand"
          icon="share-new-outline"
          title="Copy Program to URL"
          >Share</play-button
        >
      </div>
    </div>`
  }
}
