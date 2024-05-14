import {assert} from '@esm-bundle/chai'
import {PlayAssetsLocalDirectory} from './play-assets-local-directory'

test('tag is defined', () => {
  const el = document.createElement('play-assets-local-directory')
  assert.instanceOf(el, PlayAssetsLocalDirectory)
})
