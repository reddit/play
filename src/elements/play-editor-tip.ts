import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {Diagnostics} from '../types/diagnostics.js'
import ts from '../typescript/typescript.js'
import {cssReset} from '../utils/css-reset.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-editor-tip': PlayEditorTip
  }
}

@customElement('play-editor-tip')
export class PlayEditorTip extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

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

  @property({attribute: false}) diagnostics?: Diagnostics
  @property({attribute: false}) info?: ts.QuickInfo

  protected override render(): TemplateResult | typeof nothing {
    if (!this.info) return nothing
    const text = ts.displayPartsToString(this.info.displayParts)
    const docs = []
    for (const doc of this.info.documentation ?? [])
      docs.push(html`<p>${doc.text}</p>`)
    return html`<p>${text}</p>
      ${docs}`
  }
}
