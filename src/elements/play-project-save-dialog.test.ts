import {assert} from '@esm-bundle/chai'
import {PlayProjectSaveDialog} from './play-project-save-dialog.js'

test('tag is defined', () => {
  const el = document.createElement('play-project-save-dialog')
  assert.instanceOf(el, PlayProjectSaveDialog)
})
