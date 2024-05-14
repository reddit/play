import {assert} from '@esm-bundle/chai'
import {PlayAssetsVirtualFilesystem} from './play-assets-virtual-fs'

test('tag is defined', () => {
  const el = document.createElement('play-assets-virtual-fs')
  assert.instanceOf(el, PlayAssetsVirtualFilesystem)
})
