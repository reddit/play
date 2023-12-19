import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import {Bubble} from '../bubble.js'

import './play-button.js'
import './play-dropdown-menu.js'
import './play-list-item.js'

/* Available preview sizes */
const sizes: readonly [width: number, label: string][] = [
  [288, '288 - Mobile small'],
  [343, '343 - Mobile'],
  [400, '400 - Mobile large'],
  [512, '512 - Desktop Small'],
  [718, '718 - Desktop Large']
]

declare global {
  interface HTMLElementEventMap {
    'preview-scheme': CustomEvent<ColorScheme>
    'preview-width': CustomEvent<number>
  }
  interface HTMLElementTagNameMap {
    'play-preview-controls': PlayPreviewControls
  }
}

@customElement('play-preview-controls')
export class PlayPreviewControls extends LitElement {
  static override styles: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: row;
      column-gap: 8px;
    }
  `

  @property({type: Number}) previewWidth = 718
  @property() scheme: ColorScheme = globalThis.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light'

  protected override render(): TemplateResult {
    return html`
      <play-button
        appearance="plain"
        size="small"
        icon="restart-outline"
        title="Restart the preview"
        label="Restart"
        @click=${() => this.dispatchEvent(Bubble('reset', true))}
      ></play-button>

      <play-dropdown-menu direction="up">
        <div slot="trigger">
          <play-button
            appearance="plain"
            size="small"
            icon="resize-horizontal-outline"
            title="Select preview width"
            label=${this.previewWidth}
          ></play-button>
        </div>
        <div slot="menu">
          ${sizes.map(
            ([width, label]) =>
              html` <play-list-item
                label=${label}
                @click=${() =>
                  this.dispatchEvent(Bubble('preview-width', width))}
              ></play-list-item>`
          )}
        </div>
      </play-dropdown-menu>

      <play-button
        appearance="plain"
        size="small"
        icon=${this.scheme === 'dark' ? 'night-outline' : 'day-outline'}
        title="Toggle the scheme"
        label=${this.scheme === 'dark' ? 'Dark' : 'Light'}
        @click=${() =>
          this.dispatchEvent(
            Bubble('preview-scheme', this.scheme === 'dark' ? 'light' : 'dark')
          )}
      ></play-button>
    `
  }
}
