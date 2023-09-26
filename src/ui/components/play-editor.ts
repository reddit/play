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
import {highlightSelectionMatches} from '@codemirror/search'
import {EditorState, type Extension} from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  hoverTooltip,
  keymap,
  lineNumbers,
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
import ts, {displayPartsToString} from 'typescript'
import {appEntrypointFilename} from '../../bundler/compiler.js'
import {throttle} from '../../utils/throttle.js'
import {unindent} from '../../utils/unindent.js'
import {Bubble} from '../bubble.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-editor': PlayEditor
  }
}

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
      color: var(--rpl-orangered-500);
      border-right: none;
    }

    .cm-editor .cm-line {
      padding-left: 16px;
    }

    .cm-editor .cm-lineNumbers .cm-activeLineGutter {
      background-color: var(--rpl-orangered-100);
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    .cm-editor .cm-foldGutter .cm-activeLineGutter {
      background-color: var(--rpl-orangered-100);
    }
    .cm-editor .cm-activeLine {
      background-color: var(--rpl-orangered-100);
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    .cm-editor .cm-selectionBackground,
    .cm-editor .cm-content ::selection {
      background-color: var(--rpl-secondary-background-pressed) !important;
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

  setSrc(src: string): void {
    this.#editor.dispatch({
      changes: {from: 0, to: this.#editor.state.doc.length, insert: src}
    })
  }

  protected override firstUpdated(): void {
    const init = EditorState.create({
      doc: this.src ?? '',
      extensions: [
        // Mostly https://github.com/codemirror/basic-setup extension without
        // search, which we don't render well, and with [shift]-tab indenting.
        lineNumbers(),
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
      <slot @slotchange=${this._onSlotChange} />`
  }

  @eventOptions({once: true}) private _onSlotChange(): void {
    // If <script /> exists, get the program inside.
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

function tsHoverTip(env: VirtualTypeScriptEnvironment) {
  return hoverTooltip((_editor, pos) => {
    // to-do: clean up.
    console.log('hover')
    const info = env.languageService.getQuickInfoAtPosition(
      appEntrypointFilename,
      pos
    )
    if (!info) return null
    console.log('hover with info', info)
    return {
      pos: info.textSpan.start,
      end: info.textSpan.start + info.textSpan.length,
      create() {
        const dom = document.createElement('div')
        dom.className = 'cm-quickinfo-tooltip'
        dom.textContent =
          displayPartsToString(info.displayParts) +
          (info.documentation?.length
            ? '\n' + displayPartsToString(info.documentation)
            : '')

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
