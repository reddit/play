import {assert} from '@esm-bundle/chai'
import {PlayEditor} from './play-editor.js'

test('tag is defined', () => {
  const el = document.createElement('play-editor')
  assert.instanceOf(el, PlayEditor)
})
