import {assert} from '@esm-bundle/chai'
import {PlayNewPenButton} from './play-new-pen-button.js'

test('tag is defined', () => {
  const el = document.createElement('play-new-pen-button')
  assert.instanceOf(el, PlayNewPenButton)
})
