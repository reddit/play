import {assert} from '@esm-bundle/chai'
import {PlayEditorTip} from './play-editor-tip.js'

test('tag is defined', () => {
  const el = document.createElement('play-editor-tip')
  assert.instanceOf(el, PlayEditorTip)
})
