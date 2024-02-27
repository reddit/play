import {assert} from '@esm-bundle/chai'
import {PlayToast} from './play-toast.js'

test('tag is defined', () => {
  const el = document.createElement('play-toast')
  assert.instanceOf(el, PlayToast)
})
