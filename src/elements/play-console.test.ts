import {assert} from '@esm-bundle/chai'
import {PlayConsole} from './play-console.js'

test('tag is defined', () => {
  const el = document.createElement('play-console')
  assert.instanceOf(el, PlayConsole)
})
