import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {PlayIconSVG} from './play-icon.js'

import './play-icon.js'

export type PlayButtonAppearance = 'brand' | 'plain' | 'secondary' | 'inverted'
export type PlayButtonSize = 'small' | 'medium'

declare global {
  interface HTMLElementTagNameMap {
    'play-button': PlayButton
  }
}

@customElement('play-button')
export class PlayButton extends LitElement {
  @property() appearance: PlayButtonAppearance = 'secondary'
  @property({type: Boolean}) disabled?: boolean
  @property() endIcon?: PlayIconSVG
  @property() icon?: PlayIconSVG
  @property() size: PlayButtonSize = 'medium'

  static override styles = css`
    /* Default button styles. Medium size. */
    :host button {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      row-gap: 8px;
      border: none;
      border-radius: 9001px;
      align-items: center;
      height: min-content;
      cursor: pointer;
      font-family: inherit;
      user-select: none;
      white-space: nowrap;
    }

    /* Add additional horizontal padding if a label is present. */
    /* todo: fix this bug */
    ::slotted(*) button {
      padding-right: 16px;
      padding-left: 16px;
    }

    /* Size: "Small" */
    :host([size='small']) button {
      padding: 8px;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: -0.1px;
    }

    /* Size: "Medium" */
    :host([size='medium']) button {
      padding: 10px;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: -0.3px;
    }

    /* Appearance: "plain" */
    :host([appearance='plain']) button {
      color: var(--rpl-secondary-plain);
      background-color: transparent;
    }
    :host([appearance='plain']:hover) button {
      color: var(--rpl-secondary-onBackground);
      background-color: rgba(0, 0, 0, 0.1);
    }
    :host([appearance='plain']:active) button {
      color: var(--rpl-secondary-onBackground);
      background-color: rgba(0, 0, 0, 0.3);
    }
    :host([appearance='plain']) button:disabled {
      color: var(--rpl-interactive-content-disabled);
      background-color: transparent;
      cursor: unset;
    }

    /* Appearance: "brand" */
    :host([appearance='brand']) button {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background);
    }
    :host([appearance='brand']:hover) button {
      background-color: var(--rpl-brand-background-hovered);
    }
    :host([appearance='brand']:active) button {
      background-color: var(--rpl-brand-background-pressed);
    }
    :host([appearance='brand']) button:disabled {
      color: var(--rpl-interactive-content-disabled);
      background-color: var(--rpl-interactive-background-disabled);
      cursor: unset;
    }

    /* Appearance: "secondary"  */
    :host([appearance='secondary']) button {
      color: var(--rpl-secondary-onBackground);
      background-color: var(--rpl-secondary-background);
    }
    :host([appearance='secondary']:hover) button {
      background-color: var(--rpl-secondary-background-hovered);
    }
    :host([appearance='secondary']:active) button {
      background-color: var(--rpl-secondary-background-pressed);
    }
    :host([appearance='secondary']) button:disabled {
      color: var(--rpl-interactive-content-disabled);
      background-color: var(--rpl-interactive-background-disabled);
      cursor: unset;
    }

    /* Appearance: "inverted"  */
    :host([appearance='inverted']) button {
      color: var(--rpl-neutral-background);
      background-color: var(--rpl-neutral-content-weak);
    }
    :host([appearance='inverted']:hover) button {
      background-color: var(--rpl-neutral-content);
    }
    :host([appearance='inverted']:active) button {
      background-color: var(--rpl-neutral-content-strong);
    }
    :host([appearance='inverted']) button:disabled {
      color: rgba(255, 255, 255, 0.25);
      background-color: rgba(255, 255, 255, 0.05);
      cursor: unset;
    }
  `

  protected override render() {
    return html`<button ?disabled=${this.disabled}>
      ${this.icon &&
      html`<play-icon
        size=${this.size === 'small' ? '16px' : '20px'}
        icon=${this.icon}
      ></play-icon>`}<slot></slot>${this.endIcon &&
      html`<play-icon
        size=${this.size === 'small' ? '16px' : '20px'}
        icon=${this.endIcon}
      ></play-icon>`}
    </button>`
  }
}
