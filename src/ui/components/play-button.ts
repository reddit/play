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
  @property({type: String}) appearance = 'plain'
  @property({type: String}) label = ''
  @property({type: String}) icon = ''
  @property({type: String}) endIcon = ''

  static override styles = css`
    /* Default button styles. Medium size. */
    :host button {
      display: flex;
      flex-direction: row;
      gap: 8px;
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

    /* Add horizontal padding if a label */
    :host([label]) button {
      padding-right: 16px;
      padding-left: 16px;
    }

    /* Define styles for the "plain" appearance */
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

    /* Define styles for the "plain" appearance */
    :host([appearance='brand']) button {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background);
    }

    :host([appearance='brand']:hover) button {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background-hovered);
    }

    :host([appearance='brand']:active) button {
      color: var(--rpl-brand-onBackground);
      background-color: var(--rpl-brand-background-pressed);
    }

    /* to-do: Add disabled styes */
  `

  override render() {
    return html`<button>
      ${this.icon &&
      html`<play-icon size="20px" icon=${this.icon}></play-icon>`}
      ${this.label}
      ${this.endIcon &&
      html`<play-icon size="20px" icon=${this.endIcon}></play-icon>`}
    </button>`
  }
}
