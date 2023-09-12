import {autocompletion, completeFromList} from '@codemirror/autocomplete'
import {tsxLanguage} from '@codemirror/lang-javascript'
import {linter, type Diagnostic} from '@codemirror/lint'
import {EditorState, type Extension} from '@codemirror/state'
import {hoverTooltip} from '@codemirror/view'
import * as tsvfs from '@typescript/vfs'
import {EditorView, basicSetup} from 'codemirror'
import {LitElement, css, html} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import ts, {displayPartsToString} from 'typescript'
import {appEntrypointFilename} from '../../bundler/compiler.js'
import {type Pen} from '../../types/pen.js'
import {throttle} from '../../utils/throttle.js'
import {SourceChangedEvent} from '../events.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-editor': PlayEditor
  }
}

@customElement('play-editor')
export class PlayEditor extends LitElement {
  static override readonly styles = css`
    .editor {
      background: #f8f9fa;
      display: contents;
    }
    .cm-editor {
      min-height: 0;
      height: 100%;
    }
  `

  @property({attribute: false}) pen!: Pen
  @query('div') private _root!: HTMLDivElement

  #state?: EditorState

  protected override render(): unknown {
    return html`<div class="editor"></div>`
  }

  override firstUpdated(): void {
    const src = this.pen.env.getSourceFile(appEntrypointFilename)?.text ?? ''
    this.#state = EditorState.create({
      extensions: [
        basicSetup,
        tsxLanguage,
        linter(
          async (_view: EditorView): Promise<Diagnostic[]> => {
            const diagnostics =
              this.pen.env.languageService.getSemanticDiagnostics(
                appEntrypointFilename
              )
            return diagnostics.map(tsDiagnosticToMirrorDiagnostic)
          },
          {delay: 100}
        ),
        tsAutocomplete(this.pen.env),
        tsHoverTip(this.pen.env)
      ],
      doc: src
    })
    const editor = new EditorView({
      state: this.#state,
      parent: this._root,
      dispatch: async transaction => {
        editor.update([transaction])

        if (transaction.docChanged) {
          const code = transaction.state.doc.sliceString(0)
          this.#dispatchThrottledSourceChangedEvent(code || ' ') // empty strings trigger file deletion!
        }
      }
    })
  }

  #dispatchThrottledSourceChangedEvent: (code: string) => void = throttle(
    (code: string) => {
      this.dispatchEvent(SourceChangedEvent(code))
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
