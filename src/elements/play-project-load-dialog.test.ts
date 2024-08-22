import {assert} from '@esm-bundle/chai'
import {PlayProjectLoadDialog} from './play-project-load-dialog.js'

test('tag is defined', () => {
  const el = document.createElement('play-project-load-dialog')
  assert.instanceOf(el, PlayProjectLoadDialog)
})
