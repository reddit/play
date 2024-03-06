import {assert} from '@esm-bundle/chai'
import {PlaySettingsDialog} from './play-settings-dialog.js'

test('tag is defined', () => {
  const el = document.createElement('play-settings-dialog')
  assert.instanceOf(el, PlaySettingsDialog)
})
