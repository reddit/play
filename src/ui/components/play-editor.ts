import {autocompletion, completeFromList} from '@codemirror/autocomplete'
import {tsxLanguage} from '@codemirror/lang-javascript'
import {linter, type Diagnostic} from '@codemirror/lint'
import {EditorState, type Extension} from '@codemirror/state'
import {hoverTooltip} from '@codemirror/view'
import * as tsvfs from '@typescript/vfs'
import {EditorView, basicSetup} from 'codemirror'
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
    .cm-editor.cm-focused {
      outline: none;
    }
    .cm-editor .cm-gutters {
      background-color: var(--rpl-neutral-background);
      color: var(--rpl-neutral-content-weak);
      border-right: none;
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
  `

  @property({attribute: false}) env!: tsvfs.VirtualTypeScriptEnvironment

  @query('div') private _root!: HTMLDivElement

  @queryAssignedElements({
    flatten: true,
    selector: 'script[type="application/devvit"]'
  })
  private _scripts!: HTMLScriptElement[]
  #editor!: EditorView

  override firstUpdated(): void {
    const init = EditorState.create({
      extensions: [
        basicSetup,
        tsxLanguage,
        EditorView.lineWrapping,
        linter(
          async (_view: EditorView): Promise<Diagnostic[]> => {
            const diagnostics = this.env.languageService.getSemanticDiagnostics(
              appEntrypointFilename
            )
            return diagnostics.map(tsDiagnosticToMirrorDiagnostic)
          },
          {delay: 100}
        ),
        tsAutocomplete(this.env),
        tsHoverTip(this.env)
      ]
    })
    this.#editor = new EditorView({
      dispatch: async transaction => {
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
    const src = unindent(this._scripts[0]?.innerText ?? '')
    const transaction = this.#editor.state.update({
      changes: {from: 0, to: this.#editor.state.doc.length, insert: src}
    })
    this.#editor.update([transaction])
    this.#dispatchThrottledSourceChangedEvent(src)
  }

  #dispatchThrottledSourceChangedEvent: (code: string) => void = throttle(
    (code: string) => {
      this.dispatchEvent(Bubble('edit', code))
    },
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

function tsHoverTip(env: tsvfs.VirtualTypeScriptEnvironment) {
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

function tsAutocomplete(env: tsvfs.VirtualTypeScriptEnvironment): Extension {
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
