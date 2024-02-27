import {HighlightStyle, syntaxHighlighting} from '@codemirror/language'
import type {Extension} from '@codemirror/state'
import {EditorView} from '@codemirror/view'
import type {Highlighter} from '@lezer/highlight'
import {tags} from '@lezer/highlight'

// Uses CSS variables from pen-vars.css for light / dark mode. Adapted from:
// - Dark theme: https://github.com/codemirror/theme-one-dark/blob/1960ab9/src/one-dark.ts
// - Light theme: https://github.com/codemirror/language/blob/34481e7/src/highlight.ts#L194

const editorTheme: Extension = EditorView.theme({
  '&': {
    fontFamily: 'var(--font-family-mono)',
    fontSize: '14px',
    lineHeight: '1.5'
  },

  '&.cm-focused': {
    // Hide the focus outline on the whole editor.
    outline: 'none'
  },

  '.cm-scroller': {
    font: 'inherit'
  },

  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-editor-highlight-cursor)'
  },

  ['&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground,' +
  '.cm-scroller .cm-selectionBackground,' +
  '.cm-scroller .cm-content ::selection']: {
    backgroundColor: 'var(--color-editor-selection-background) !important'
  },

  '.cm-panels': {
    backgroundColor: 'var(--color-editor-panel-background)',
    color: 'var(--color-foreground)'
  },

  // to-do: extract buttonish styles that are compatible with both a .buttonish
  // class and .cm-button.
  '.cm-button': {
    color: 'var(--color-secondary-plain)',
    backgroundColor: '#0000',
    backgroundImage: 'none',
    boxShadow:
      'inset 0px 0px 0px var(--border-width) var(--color-secondary-border)',
    cursor: 'pointer'
  },
  '.cm-button:hover': {
    color: 'var(--color-secondary-foreground)',
    backgroundColor: 'var(--color-secondary-background-hovered)'
  },
  '.cm-button:active': {
    color: 'var(--color-secondary-foreground)',
    backgroundColor: 'var(--color-secondary-background-active)'
  },
  '.cm-button:disabled': {
    color: 'var(--color-interactive-content-disabled)',
    backgroundColor: '#0000',
    cursor: 'unset'
  },
  'button[name="close"]': {color: 'var(--color-foreground)', cursor: 'pointer'},

  '.cm-activeLine': {
    backgroundColor: 'var(--color-editor-highlight-background)',
    borderTopRightRadius: '4px',
    borderBottomRightRadius: '4px'
  },

  '.cm-tooltip': {
    backgroundColor: 'var(--color-editor-panel-background)',
    color: 'var(--color-foreground)'
  },
  '.cm-gutters': {
    // Hide the background.
    backgroundColor: '#0000',
    // Hide the border.
    borderRight: 'none',
    color: 'var(--color-editor-decor)'
  },

  '.cm-activeLineGutter': {
    // Round the active line in the editor but outside the gutter.
    backgroundColor: 'var(--color-editor-highlight-background)'
  },

  '.cm-lineNumbers .cm-activeLineGutter': {
    // Round the active line in the gutter.
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px'
  }
})

const highlightStyle: HighlightStyle = HighlightStyle.define([
  {tag: tags.keyword, color: 'var(--color-editor-text-keyword)'},
  {
    tag: [tags.atom, tags.bool, tags.labelName],
    color: 'var(--color-editor-text-constant)'
  },
  {
    tag: [tags.literal],
    color: 'var(--color-editor-text-literal)'
  },
  {tag: [tags.string], color: 'var(--color-editor-text-string)'},
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: 'var(--color-editor-text-regexp)'
  },
  {
    tag: [tags.definition(tags.variableName), tags.special(tags.variableName)],
    color: 'var(--color-editor-text-var-name)'
  },
  {
    tag: tags.local(tags.variableName),
    color: 'var(--color-editor-text-local-var-name)'
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: 'var(--color-editor-text-type-name)'
  },
  {tag: tags.className, color: 'var(--color-editor-text-class-name)'},
  {
    tag: tags.propertyName,
    color: 'var(--color-editor-text-prop-name)'
  },
  {tag: tags.comment, color: 'var(--color-editor-text-comment)'},
  {tag: tags.invalid, color: 'var(--color-editor-text-invalid)'}
])

export const editorThemeExtension: Extension = [
  editorTheme,
  syntaxHighlighting(highlightStyle as Highlighter)
]
