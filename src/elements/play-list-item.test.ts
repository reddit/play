import {assert} from '@esm-bundle/chai'
import {PlayListItem} from './play-list-item.js'

test('tag is defined', () => {
  const el = document.createElement('play-list-item')
  assert.instanceOf(el, PlayListItem)
})
