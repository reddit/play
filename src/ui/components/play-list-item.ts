import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {PlayIconSVG} from './play-icon.js'

import './play-icon.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-list-item': PlayListItem
  }
}

@customElement('play-list-item')
export class PlayListItem extends LitElement {
  @property() label: String = ''
  @property() icon?: PlayIconSVG

  static override styles = css`
    li {
      display: flex;
      flex-direction: row;
      column-gap: 14px;
      padding-top: 14px;
      padding-right: 16px;
      padding-bottom: 14px;
      padding-left: 22px;
      font-family: inherit;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      cursor: pointer;
      background-color: var(--color-neutral-background);
      white-space: nowrap;
    }

    li:hover {
      background-color: var(--color-neutral-background-hovered);
      color: var(--color-secondary-onBackground);
    }
  `

  protected override render() {
    return html`<li>
      ${this.icon &&
      html`<play-icon size="20px" icon=${this.icon}></play-icon>`}
      ${this.label}
    </li>`
  }
}
