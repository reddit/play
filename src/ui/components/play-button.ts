import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {PlayIconSVG} from './play-icon.js'

import './play-icon.js'

export type PlayButtonAppearance =
  | 'bordered'
  | 'orangered'
  | 'plain'
  | 'inverted'
export type PlayButtonSize = 'small' | 'medium'

declare global {
  interface HTMLElementTagNameMap {
    'play-button': PlayButton
  }
}

@customElement('play-button')
export class PlayButton extends LitElement {
  @property() appearance: PlayButtonAppearance = 'plain'
  @property({type: Boolean}) disabled?: boolean
  @property() endIcon?: PlayIconSVG
  @property() icon?: PlayIconSVG
  @property() size: PlayButtonSize = 'medium'
  @property({type: String}) label = ''
  @property({type: Number}) badge = 0

  static override styles = css`
    /* Default button styles. Medium size. */
    button {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      align-items: center;
      height: min-content;
      cursor: pointer;
      font-family: inherit;
      user-select: none;
      white-space: nowrap;
      border: none;
      border-radius: 9001px;
    }

    /* Size: "Small" */
    :host([size='small']) button {
      padding-top: 8px;
      padding-right: 12px;
      padding-bottom: 8px;
      padding-left: 12px;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: -0.1px;
    }
    :host([size='small']) button.icon-button {
      padding-right: 8px;
      padding-left: 8px;
    }

    /* Size: "Medium" */
    :host([size='medium']) button {
      padding-top: 10px;
      padding-right: 16px;
      padding-bottom: 10px;
      padding-left: 16px;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: -0.3px;
    }
    :host([size='medium']) button.icon-button {
      padding-right: 10px;
      padding-left: 10px;
    }

    /* Appearance: "bordered" */
    :host([appearance='bordered']) button {
      color: var(--color-secondary-plain);
      background-color: transparent;
      box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.2);
    }
    :host([appearance='bordered']:hover) button {
      color: var(--color-secondary-onBackground);
      background-color: rgba(0, 0, 0, 0.1);
    }
    :host([appearance='bordered']:active) button {
      color: var(--color-secondary-onBackground);
      background-color: rgba(0, 0, 0, 0.3);
    }
    :host([appearance='bordered']) button:disabled {
      color: var(--color-interactive-content-disabled);
      background-color: transparent;
      cursor: unset;
    }

    /* Appearance: "orangered" */
    :host([appearance='orangered']) button {
      color: var(--color-brand-onBackground);
      background-color: var(--color-brand-background);
    }
    :host([appearance='orangered']:hover) button {
      background-color: var(--color-brand-background-hovered);
    }
    :host([appearance='orangered']:active) button {
      background-color: var(--color-brand-background-pressed);
    }
    :host([appearance='orangered']) button:disabled {
      color: var(--color-interactive-content-disabled);
      background-color: var(--color-interactive-background-disabled);
      cursor: unset;
    }

    /* Appearance: "plain"  */
    :host([appearance='plain']) button {
      color: var(--color-secondary-onBackground);
      background-color: transparent;
    }
    :host([appearance='plain']:hover) button {
      background-color: rgba(0, 0, 0, 0.1);
    }
    :host([appearance='plain']:active) button {
      background-color: rgba(0, 0, 0, 0.3);
    }
    :host([appearance='plain']) button:disabled {
      color: var(--color-interactive-content-disabled);
      background-color: var(--color-interactive-background-disabled);
      cursor: unset;
    }

    /* Appearance: "inverted"  */
    :host([appearance='inverted']) button {
      color: var(--color-neutral-background);
      background-color: var(--color-neutral-content-weak);
    }
    :host([appearance='inverted']:hover) button {
      background-color: var(--color-neutral-content);
    }
    :host([appearance='inverted']:active) button {
      background-color: var(--color-neutral-content-strong);
    }
    :host([appearance='inverted']) button:disabled {
      color: rgba(255, 255, 255, 0.25);
      background-color: rgba(255, 255, 255, 0.05);
      cursor: unset;
    }

    button:focus {
      outline-color: var(--color-brand-background);
    }

    .badge {
      color: var(--color-neutral-background);
      border-radius: 9001px;
      background-color: var(--color-orangered-500);
      padding-top: 0px;
      padding-right: 4px;
      padding-bottom: 0px;
      padding-left: 4px;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      outline-width: 2px;
      outline-style: solid;
      outline-color: var(--color-orangered-500);
    }
  `

  protected override render() {
    const iconOnly = this.icon && !this.label && !this.endIcon
    return html`<button
      ?disabled=${this.disabled}
      class=${iconOnly ? 'icon-button' : ''}
    >
      ${this.icon &&
      html`<play-icon
        size=${this.size === 'small' ? '16px' : '20px'}
        icon=${this.icon}
      ></play-icon>`}
      <slot></slot>
      ${this.label && html`<span>${this.label}</span>`}
      ${this.badge > 0 ? html`<span class="badge">${this.badge}</span>` : ''}
      ${this.endIcon &&
      html`<play-icon
        size=${this.size === 'small' ? '16px' : '20px'}
        icon=${this.endIcon}
      ></play-icon>`}
    </button>`
  }
}
