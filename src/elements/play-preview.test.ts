import {assert} from '@esm-bundle/chai'
import {PlayPreview} from './play-preview.js'

test('tag is defined', () => {
  const el = document.createElement('play-preview')
  assert.instanceOf(el, PlayPreview)
})
