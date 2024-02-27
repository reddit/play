import {assert} from '@esm-bundle/chai'
import {PlayDropdownMenu} from './play-dropdown-menu.js'

test('tag is defined', () => {
  const el = document.createElement('play-dropdown-menu')
  assert.instanceOf(el, PlayDropdownMenu)
})
