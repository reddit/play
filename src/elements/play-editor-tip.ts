import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import ts, {displayPartsToString} from 'typescript'
import type {Diagnostics} from '../types/diagnostics.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-editor-tip': PlayEditorTip
  }
}

@customElement('play-editor-tip')
export class PlayEditorTip extends LitElement {
  @property({attribute: false}) diagnostics?: Diagnostics

  static override styles: CSSResultGroup = css`
    :host {
      display: block;
      max-width: 640px;
    }
    p:first-child {
      margin-top: 0;
    }
    p:last-child {
      margin-bottom: 0;
    }
  `

  @property({attribute: false}) info?: ts.QuickInfo

  protected override render(): TemplateResult | typeof nothing {
    if (!this.info) return nothing
    const text = displayPartsToString(this.info.displayParts)
    const docs = []
    for (const doc of this.info.documentation ?? [])
      docs.push(html`<p>${doc.text}</p>`)
    return html`<p>${text}</p>
      ${docs}`
  }
}
