import {assert} from '@esm-bundle/chai'
import {PlayPenFooter} from './play-pen-footer.js'

test('tag is defined', () => {
  const el = document.createElement('play-pen-footer')
  assert.instanceOf(el, PlayPenFooter)
})
