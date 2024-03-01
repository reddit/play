import {EditorSelection} from '@codemirror/state'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import {EditorView} from 'codemirror'
import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {
  customElement,
  eventOptions,
  property,
  queryAssignedElements,
  queryAsync
} from 'lit/decorators.js'
import {Bubble} from '../../utils/bubble.js'
import {cssReset} from '../../utils/css-reset.js'
import {unindent} from '../../utils/unindent.js'
import {newEditorState} from './editor-state.js'

declare global {
  interface HTMLElementEventMap {
    edit: CustomEvent<string>
    'edit-template': CustomEvent<string>
  }
  interface HTMLElementTagNameMap {
    'play-editor': PlayEditor
  }
}

/** @slot - Optional template. */
@customElement('play-editor')
export class PlayEditor extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    .editor {
      height: 100%;
      width: 100%;
    }
    .cm-editor {
      height: 100%;
      overflow: hidden;
    }
  `

  @property({attribute: false}) env?: VirtualTypeScriptEnvironment
  @property() src: string = ''

  @queryAsync('.editor') private _editorEl!: Promise<HTMLDivElement>

  @queryAssignedElements({
    flatten: true,
    selector: 'script[type="application/devvit"]'
  })
  private _scripts!: HTMLScriptElement[]
  #editor?: EditorView

  /**
   * @arg line One-based index.
   * @arg char Zero-based index.
   */
  openLine(line: number, char: number): void {
    if (!this.#editor) return
    const info = this.#editor.state.doc.line(line)
    const selection = EditorSelection.create([
      EditorSelection.cursor(info.from + char)
    ])
    this.#editor.dispatch({selection: selection, scrollIntoView: true})
    this.#editor.focus()
  }

  setSrc(src: string): void {
    this.#editor?.dispatch({
      changes: {from: 0, to: this.#editor.state.doc.length, insert: src}
    })
  }

  protected override async willUpdate(
    props: PropertyValues<this>
  ): Promise<void> {
    if (props.has('env') && this.env && !this.#editor) {
      const el = await this._editorEl
      const init = newEditorState(this.env, this.src)
      this.#editor = new EditorView({
        dispatch: transaction => {
          this.#editor!.update([transaction])
          if (transaction.docChanged) {
            const src = transaction.state.doc.sliceString(0)
            this.dispatchEvent(Bubble<string>('edit', src))
          }
        },
        parent: el,
        state: init
      })
    }
  }

  protected override render(): TemplateResult {
    return html`
      <div class="editor"></div>
      <slot @slotchange=${this._onSlotChange}></slot>
    `
  }

  @eventOptions({once: true}) private _onSlotChange(): void {
    // If <script> exists, get the program inside.
    let src = this._scripts[0]?.innerText
    if (src == null) return
    src = unindent(src ?? '')
    this.dispatchEvent(Bubble<string>('edit-template', src))
  }
}
