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
  foldGutter,
  foldKeymap,
  indentOnInput
} from '@codemirror/language'
import {lintKeymap, linter, type Diagnostic} from '@codemirror/lint'
import {highlightSelectionMatches, searchKeymap} from '@codemirror/search'
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
import ts from 'typescript'
import {appEntrypointFilename} from '../../bundler/compiler.js'
import {PlayEditorTip} from '../play-editor-tip.js'
import {editorThemeExtension} from './editor-theme.js'

export function newEditorState(
  env: VirtualTypeScriptEnvironment,
  src: string
): EditorState {
  return EditorState.create({
    doc: src,
    extensions: [
      // Mostly https://github.com/codemirror/basic-setup extension with
      // [shift]-tab indenting.
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      editorThemeExtension,
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
        // This is for presenting type-checking errors.
        const diagnostics = env.languageService.getSemanticDiagnostics(
          appEntrypointFilename
        )
        return diagnostics.map(tsDiagnosticToMirrorDiagnostic)
      }),
      codeCompletion(env),
      typingHoverTip(env)
    ]
  })
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
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    source: diagnostic.source ?? ''
  }
}

function typingHoverTip(env: VirtualTypeScriptEnvironment): Extension {
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

function codeCompletion(env: VirtualTypeScriptEnvironment): Extension {
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
