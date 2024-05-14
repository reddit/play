import {assert} from '@esm-bundle/chai'
import {PlayAssetsDialog} from './play-assets-dialog'

test('tag is defined', () => {
  const el = document.createElement('play-assets-dialog')
  assert.instanceOf(el, PlayAssetsDialog)
})
