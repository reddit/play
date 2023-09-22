import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'

import './play-icon.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-button': PlayButton
  }
}

@customElement('play-button')
export class PlayButton extends LitElement {
  @property({type: String}) appearance = 'secondary'
  @property({type: String}) icon = ''
  @property({type: String}) endIcon = ''
  @property({type: Boolean}) disabled = false

  static override styles = css`
    /* Default button styles. Medium size. */
    :host button {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
      row-gap: 8px;
      padding: 10px;
      border: none;
      border-radius: 9001px;
      align-items: center;
      height: min-content;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      letter-spacing: -0.3px;
      user-select: none;
    }

    /* Add additional horizontal padding if a label is present. */
    :host([label]) button {
      padding-right: 16px;
      padding-left: 16px;
    }

    /* Appearance: "plain" */
    :host([appearance='plain']) button {
      color: var(--rpl-secondary-plain);
      background-color: transparent;
    }
    :host([appearance='plain']:hover) button {
      color: var(--rpl-secondary-onBackground);
      background-color: var(--rpl-secondary-background-hovered);
    }
    :host([appearance='plain']:active) button {
      color: var(--rpl-secondary-onBackground);
      background-color: var(--rpl-secondary-background-pressed);
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
  `

  protected override render() {
    return html`<button ?disabled=${this.disabled}>
      ${this.icon &&
      html`<play-icon size="20px" icon=${this.icon}></play-icon>`}<slot
      ></slot>${this.endIcon &&
      html`<play-icon size="20px" icon=${this.endIcon}></play-icon>`}
    </button>`
  }
}
