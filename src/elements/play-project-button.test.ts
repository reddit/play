import {assert} from '@esm-bundle/chai'
import {PlayProjectButton} from './play-project-button.js'

test('tag is defined', () => {
  const el = document.createElement('play-project-button')
  assert.instanceOf(el, PlayProjectButton)
})
