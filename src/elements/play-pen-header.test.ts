import {assert} from '@esm-bundle/chai'
import {PlayPenHeader} from './play-pen-header.js'

test('tag is defined', () => {
  const el = document.createElement('play-pen-header')
  assert.instanceOf(el, PlayPenHeader)
})
