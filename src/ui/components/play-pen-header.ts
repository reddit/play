import {LitElement, css, html} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {openURL} from '../../utils/open-url.js'
import {Bubble} from '../bubble.js'
import type {PlayExportDialog} from './play-export-dialog.js'

import './play-button.js'
import './play-export-dialog.js'
import './play-icon.js'
import './play-logo.js'
import './play-new-pen-button.js'
import './play-resizable-text-input.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-header': PlayPenHeader
  }
}

/**
 * @fires {string} edit-name
 * @fires {undefined} share
 */
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
  @property() url: string = ''
  @query('play-export-dialog') private _export!: PlayExportDialog

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
          size="small"
          .srcByLabel=${this.srcByLabel}
        ></play-new-pen-button
        ><play-export-dialog url=${this.url}></play-export-dialog
        ><play-button
          appearance="bordered"
          size="small"
          title="Export Pen"
          label="Export"
          @click=${() => this._export.open()}
        ></play-button
        ><play-button
          appearance="bordered"
          size="small"
          icon="external-outline"
          title="Open Documentation"
          label="Docs"
          @click=${() => openURL('https://developers.reddit.com/docs')}
        ></play-button>
      </div>
    </header>`
  }
}
