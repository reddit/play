import {customElement} from 'lit/decorators.js'
import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {cssReset} from '../../utils/css-reset.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-virtual-fs': PlayAssetsVirtualFilesystem
  }
}

@customElement('play-assets-virtual-fs')
export class PlayAssetsVirtualFilesystem extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}
  `

  protected override render(): TemplateResult {
    return html``
  }
}
