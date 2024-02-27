import {assert} from '@esm-bundle/chai'
import {PlayButton} from './play-button.js'

test('tag is defined', () => {
  const el = document.createElement('play-button')
  assert.instanceOf(el, PlayButton)
})
