import {LitElement, css, html} from 'lit'
import {
  customElement,
  eventOptions,
  queryAssignedElements
} from 'lit/decorators.js'

import {Pen} from '../../types/pen.js'
import {unindent} from '../../utils/unindent.js'
import {SourceChangedEvent} from '../events.js'
import './play-editor.js'
import './play-preview.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen': PlayPen
  }
}

/**
 * A complete and standalone playground: an editor, a runtime and client, a
 * preview and toolbar.
 */
@customElement('play-pen')
export class PlayPen extends LitElement {
  static override styles = css`
    div {
      display: flex;
      flex-direction: column;

      /* Fill the viewport. */
      height: 100%;
    }

    play-editor {
      /* Occupy available space. */
      flex-shrink: 1;

      /** The editor can be shrunk. */
      flex-grow: 1;
      min-height: 0;
    }
  `

  @queryAssignedElements({selector: 'script[type=devvit]'})
  private _scripts!: HTMLScriptElement[]
  #pen: Pen = Pen()

  override render() {
    return html`
      <div>
        <play-editor .pen=${this.#pen}></play-editor>
        <play-preview .pen=${this.#pen}></play-preview>
      </div>
      <slot @slotchange=${this._onSlotChange}></slot>
    `
  }

  @eventOptions({once: true}) private _onSlotChange(): void {
    // If <script>...</script> exists, get the program inside.
    const src = unindent(this._scripts[0]?.innerText ?? '')
    this.dispatchEvent(SourceChangedEvent(src))
  }
}
