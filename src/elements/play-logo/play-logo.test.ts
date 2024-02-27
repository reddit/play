import {assert} from '@esm-bundle/chai'
import {PlayLogo} from './play-logo.js'

test('tag is defined', () => {
  const el = document.createElement('play-logo')
  assert.instanceOf(el, PlayLogo)
})
