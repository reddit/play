import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {repeat} from 'lit/directives/repeat.js'
import {Bubble} from '../bubble.js'

import './play-button.js'
import './play-details.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-template-select': PlayTemplateSelect
  }
}

@customElement('play-template-select')
export class PlayTemplateSelect extends LitElement {
  static override styles = css``

  @property({attribute: false}) srcByLabel?: Readonly<{[key: string]: string}>
  @property({type: Boolean}) open?: boolean

  protected override render() {
    return html`<play-details
      appearance="plain"
      ?disabled=${!Object.keys(this.srcByLabel ?? {}).length}
      ?open=${this.open}
      size="medium"
      icon="add-outline"
      title="Reset Program Template"
      @open=${(ev: CustomEvent<boolean>) => (this.open = ev.detail)}
      ><span slot="summary">New</span>
      <ul>
        ${repeat(
          Object.entries(this.srcByLabel ?? {}),
          ([label]) => label,
          ([label, src]) =>
            html`<play-button
              appearance="plain"
              size="small"
              @click=${() => {
                this.dispatchEvent(Bubble('edit-src', src))
                this.open = false
              }}
              >${label}</play-button
            >`
        )}
      </ul></play-details
    >`
  }
}
