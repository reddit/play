import {assert} from '@esm-bundle/chai'
import {PlayResizableTextInput} from './play-resizable-text-input.js'

test('tag is defined', () => {
  const el = document.createElement('play-resizable-text-input')
  assert.instanceOf(el, PlayResizableTextInput)
})
