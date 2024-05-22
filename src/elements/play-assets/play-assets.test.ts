import {assert} from '@esm-bundle/chai'
import {PlayAssets} from './play-assets'

test('tag is defined', () => {
  const el = document.createElement('play-assets')
  assert.instanceOf(el, PlayAssets)
})
