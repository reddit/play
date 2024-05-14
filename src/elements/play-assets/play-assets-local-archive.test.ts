import {assert} from '@esm-bundle/chai'
import {PlayAssetsLocalArchive} from './play-assets-local-archive'

test('tag is defined', () => {
  const el = document.createElement('play-assets-local-archive')
  assert.instanceOf(el, PlayAssetsLocalArchive)
})
