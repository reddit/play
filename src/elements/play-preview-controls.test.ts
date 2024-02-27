import {assert} from '@esm-bundle/chai'
import {PlayPreviewControls} from './play-preview-controls.js'

test('tag is defined', () => {
  const el = document.createElement('play-preview-controls')
  assert.instanceOf(el, PlayPreviewControls)
})
