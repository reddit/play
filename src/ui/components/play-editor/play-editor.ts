import {EditorSelection} from '@codemirror/state'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import {EditorView} from 'codemirror'
import {LitElement, css, html} from 'lit'
import {
  customElement,
  eventOptions,
  property,
  query,
  queryAssignedElements
} from 'lit/decorators.js'
import {unindent} from '../../../utils/unindent.js'
import {Bubble} from '../../bubble.js'
import {newEditorState} from './editor-state.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-editor': PlayEditor
  }
}

/**
 * @fires {string} edit
 * @fires {string} edit-template
 * @slot - Optional template.
 */
/** Accepts a slotted template. */
@customElement('play-editor')
export class PlayEditor extends LitElement {
  static override readonly styles = css`
    .editor {
      height: 100%;
      width: 100%;
    }
    .cm-editor {
      height: 100%;
      overflow: hidden;
    }
  `

  @property({attribute: false}) env!: VirtualTypeScriptEnvironment
  @property() src: string | undefined

  @query('div') private _root!: HTMLDivElement

  @queryAssignedElements({
    flatten: true,
    selector: 'script[type="application/devvit"]'
  })
  private _scripts!: HTMLScriptElement[]
  #editor!: EditorView

  /**
   * @arg line One-based index.
   * @arg char Zero-based index.
   */
  openLine(line: number, char: number): void {
    const info = this.#editor.state.doc.line(line)
    const selection = EditorSelection.create([
      EditorSelection.cursor(info.from + char)
    ])
    this.#editor.dispatch({selection: selection, scrollIntoView: true})
    this.#editor.focus()
  }

  setSrc(src: string): void {
    this.#editor.dispatch({
      changes: {from: 0, to: this.#editor.state.doc.length, insert: src}
    })
  }

  protected override firstUpdated(): void {
    const init = newEditorState(this.env, this.src ?? '')
    this.#editor = new EditorView({
      dispatch: transaction => {
        this.#editor.update([transaction])

        if (transaction.docChanged) {
          const src = transaction.state.doc.sliceString(0)
          this.dispatchEvent(Bubble('edit', src))
        }
      },
      parent: this._root,
      state: init
    })
  }

  protected override render(): unknown {
    return html`<div class="editor"></div>
      <slot @slotchange=${this._onSlotChange}></slot>`
  }

  @eventOptions({once: true}) private _onSlotChange(): void {
    // If <script> exists, get the program inside.
    let src = this._scripts[0]?.innerText
    if (src == null) return
    src = unindent(src ?? '')
    this.dispatchEvent(Bubble('edit-template', src))
  }
}
