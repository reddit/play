import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {PlayIconSVG} from './play-icon/play-icon.js'

import {cssReset} from '../utils/css-reset.js'
import './play-icon/play-icon.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-list-item': PlayListItem
  }
}

@customElement('play-list-item')
export class PlayListItem extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    li {
      display: flex;
      flex-direction: row;
      column-gap: 14px;
      padding-top: 14px;
      padding-right: 16px;
      padding-bottom: 14px;
      padding-left: 22px;
      font-family: var(--font-family-sans);
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
      color: var(--color-secondary-foreground);
    }
  `

  @property() label: String = ''
  @property() icon?: PlayIconSVG
  @property() endIcon?: PlayIconSVG

  protected override render(): TemplateResult {
    return html`
      <li>
        ${this.icon &&
        html`<play-icon size="20px" icon=${this.icon}></play-icon>`}
        ${this.label}
        ${this.endIcon &&
        html`<play-icon size="20px" icon=${this.endIcon}></play-icon>`}
      </li>
    `
  }
}
