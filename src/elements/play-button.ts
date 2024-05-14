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

/** @slot - Contents. */
@customElement('play-button')
export class PlayButton extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    :host {
      width: fit-content;
      display: inline-block;
    }

    /* to-do: consolidate to buttonish.css use in new template button and
       .cm-button. */

    /* Default button styles. Medium size. */
    button {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      align-items: center;
      height: min-content;
      cursor: pointer;
      font-family: var(--font-family-sans);
      user-select: none;
      white-space: nowrap;
      border: none;
      border-radius: var(--radius-full);
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
      box-shadow: inset 0px 0px 0px var(--border-width)
        var(--color-secondary-border);
    }
    :host([appearance='bordered']:hover) button {
      color: var(--color-secondary-foreground);
      background-color: var(--color-secondary-background-hovered);
    }
    :host([appearance='bordered']:active) button {
      color: var(--color-secondary-foreground);
      background-color: var(--color-secondary-background-active);
    }
    :host([appearance='bordered']) button:disabled {
      color: var(--color-interactive-content-disabled);
      background-color: transparent;
      cursor: unset;
    }

    /* Appearance: "orangered" */
    :host([appearance='orangered']) button {
      color: var(--color-brand-foreground);
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
      color: var(--color-secondary-foreground);
      background-color: transparent;
    }
    :host([appearance='plain']:hover) button {
      background-color: var(--color-secondary-background-hovered);
    }
    :host([appearance='plain']:active) button {
      background-color: var(--color-secondary-background-active);
    }
    :host([appearance='plain']) button:disabled {
      color: var(--color-interactive-content-disabled);
      background-color: var(--color-interactive-background-disabled);
      cursor: unset;
    }

    /* Appearance: "inverted"  */
    :host([appearance='inverted']) button {
      color: var(--color-neutral-foreground);
      background-color: var(--color-neutral-content-weak);
    }
    :host([appearance='inverted']:hover) button {
      background-color: var(--color-neutral-content);
    }
    :host([appearance='inverted']:active) button {
      background-color: var(--color-neutral-content-strong);
    }
    :host([appearance='inverted']) button:disabled {
      color: var(--color-neutral-disabled);
      background-color: var(--color-neutral-background-disabled);
      cursor: unset;
    }

    button:focus {
      outline-color: var(--color-brand-background);
    }

    /* to-do: extract to component. */
    .badge {
      color: var(--color-notification-foreground);
      border-radius: var(--radius-full);
      background-color: var(--color-notification-background);
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
      outline-color: var(--color-notification-background);
    }
  `

  @property() appearance: PlayButtonAppearance = 'plain'
  @property({type: Boolean}) disabled?: boolean
  @property() endIcon?: PlayIconSVG
  @property() icon?: PlayIconSVG
  @property({attribute: 'icon-color', type: String}) iconColor?: string
  @property() size: PlayButtonSize = 'medium'
  @property({type: String}) label = ''
  @property({type: Number}) badge = 0

  protected override render(): TemplateResult {
    const iconOnly = this.icon && !this.label && !this.endIcon
    return html`
      <button ?disabled=${this.disabled} class=${iconOnly ? 'icon-button' : ''}>
        ${this.icon &&
        html`
          <play-icon
            size=${this.size === 'small' ? '16px' : '20px'}
            icon=${this.icon}
            color=${this.iconColor}
          ></play-icon>
        `}
        <slot></slot>
        ${this.label && html`<span>${this.label}</span>`}
        ${this.badge > 0 ? html`<span class="badge">${this.badge}</span>` : ''}
        ${this.endIcon &&
        html`
          <play-icon
            size=${this.size === 'small' ? '16px' : '20px'}
            icon=${this.endIcon}
            color=${this.iconColor}
          ></play-icon>
        `}
      </button>
    `
  }
}
