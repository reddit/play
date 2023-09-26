import {LitElement, css, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {PlayButtonAppearance, PlayButtonSize} from './play-button.js'
import type {PlayIconSVG} from './play-icon.js'
import {ifDefined} from 'lit/directives/if-defined.js'
import {Bubble} from '../bubble.js'

import './play-button.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-details': PlayDetails
  }
}

@customElement('play-details')
export class PlayDetails extends LitElement {
  static override styles = css`
    slot:not([name])::slotted(*) {
      position: absolute;
      border-color: var(--rpl-neutral-border);
      border-radius: 16px;
      border-style: solid;
      background-color: var(--rpl-neutral-background);
      border-color: var(--rpl-neutral-border);
      border-width: 1px;
      padding: 16px;
      margin-top: 2px;
      white-space: nowrap;
    }
  `

  @property() appearance: PlayButtonAppearance = 'secondary'
  @property({type: Boolean}) disabled?: boolean
  @property() icon?: PlayIconSVG
  @property() size: PlayButtonSize = 'medium'
  @property() direction: 'up' | 'down' = 'down'
  @property({type: Boolean}) open?: boolean

  protected override render() {
    return html`<play-button
        appearance=${this.appearance}
        ?disabled=${this.disabled}
        endIcon=${<const>`caret-${this.direction}-outline`}
        icon=${ifDefined(this.icon)}
        size=${this.size}
        @click=${() => {
          this.open = !this.open
          this.dispatchEvent(Bubble('open', this.open))
        }}
        ><slot name="summary"></slot></play-button
      >${this.open ? html`<slot></slot>` : nothing}`
  }
}
