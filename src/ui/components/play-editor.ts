import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completeFromList,
  completionKeymap
} from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import {tsxLanguage} from '@codemirror/lang-javascript'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  foldKeymap,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language'
import {lintKeymap, linter, type Diagnostic} from '@codemirror/lint'
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search'
import {EditorSelection, EditorState, type Extension} from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  hoverTooltip,
  keymap,
  rectangularSelection
} from '@codemirror/view'
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
import ts from 'typescript'
import {appEntrypointFilename} from '../../bundler/compiler.js'
import {throttle} from '../../utils/throttle.js'
import {unindent} from '../../utils/unindent.js'
import {Bubble} from '../bubble.js'
import {PlayEditorTip} from './play-editor-tip.js'

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
      font-family: ui-monospace, Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono',
        'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro',
        'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
    }

    .cm-editor .cm-scroller {
      font: inherit;
    }

    .cm-editor.cm-focused {
      outline: none;
    }
    .cm-editor .cm-gutters {
      background-color: transparent;
      color: var(--color-orangered-500);
      border-right: none;
    }

    .cm-editor .cm-line {
      padding-left: 16px;
    }

    .cm-editor .cm-lineNumbers .cm-activeLineGutter {
      background-color: var(--color-orangered-100);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    .cm-editor .cm-foldGutter .cm-activeLineGutter {
      background-color: var(--color-orangered-100);
    }
    .cm-editor .cm-activeLine {
      background-color: var(--color-orangered-100);
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    .cm-editor .cm-selectionBackground,
    .cm-editor .cm-content ::selection {
      background-color: var(--color-secondary-background-pressed) !important;
    }

    @media (prefers-color-scheme: dark) {
      .cm-editor .cm-selectionBackground,
      .cm-editor .cm-content ::selection {
        background-color: rgba(255, 255, 255, 0.5) !important;
      }
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
    const init = EditorState.create({
      doc: this.src ?? '',
      extensions: [
        // Mostly https://github.com/codemirror/basic-setup extension with
        // [shift]-tab indenting.
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        // @ts-expect-error
        syntaxHighlighting(defaultHighlightStyle, {fallback: true}),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...lintKeymap,
          ...searchKeymap,
          indentWithTab
        ]),

        tsxLanguage,
        EditorView.lineWrapping,
        linter((_view: EditorView): Diagnostic[] => {
          const diagnostics = this.env.languageService.getSemanticDiagnostics(
            appEntrypointFilename
          )
          return diagnostics.map(tsDiagnosticToMirrorDiagnostic)
        }),
        tsAutocomplete(this.env),
        tsHoverTip(this.env)
      ]
    })
    this.#editor = new EditorView({
      dispatch: transaction => {
        this.#editor.update([transaction])

        if (transaction.docChanged) {
          const src = transaction.state.doc.sliceString(0)
          this.#dispatchThrottledSourceChangedEvent(src)
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

  #dispatchThrottledSourceChangedEvent: (src: string) => void = throttle(
    (src: string) => this.dispatchEvent(Bubble('edit', src)),
    500
  )
}

function tsDiagnosticToMirrorDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
  const severity = (<const>{
    [ts.DiagnosticCategory.Error]: 'error',
    [ts.DiagnosticCategory.Warning]: 'warning',
    [ts.DiagnosticCategory.Suggestion]: 'info',
    [ts.DiagnosticCategory.Message]: 'info'
  })[diagnostic.category]
  return {
    from: diagnostic.start ?? 0,
    to: (diagnostic.start ?? 0) + (diagnostic.length ?? 0),
    severity,
    message: String(diagnostic.messageText),
    source: diagnostic.source ?? ''
  }
}

function tsHoverTip(env: VirtualTypeScriptEnvironment): Extension {
  return hoverTooltip((_editor, pos) => {
    const info = env.languageService.getQuickInfoAtPosition(
      appEntrypointFilename,
      pos
    )
    if (!info) return null
    return {
      pos: info.textSpan.start,
      end: info.textSpan.start + info.textSpan.length,
      create() {
        const dom = new PlayEditorTip()
        dom.info = info
        return {dom}
      }
    }
  })
}

function tsAutocomplete(env: VirtualTypeScriptEnvironment): Extension {
  return autocompletion({
    override: [
      ctx => {
        const completions = env.languageService.getCompletionsAtPosition(
          appEntrypointFilename,
          ctx.pos,
          {
            // to-do: explore the many completion options here.
          }
        )
        if (!completions) return null

        return completeFromList(
          completions.entries.map(completion => ({
            type: completion.kind,
            label: completion.name,
            detail: completion.labelDetails?.detail ?? ''
          }))
        )(ctx)
      }
    ]
  })
}
