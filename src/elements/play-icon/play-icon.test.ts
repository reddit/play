import {assert} from '@esm-bundle/chai'
import {PlayIcon} from './play-icon.js'

test('tag is defined', () => {
  const el = document.createElement('play-icon')
  assert.instanceOf(el, PlayIcon)
})
