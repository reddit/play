import {assert} from '@esm-bundle/chai'
import {PlayExportDialog} from './play-export-dialog.js'

test('tag is defined', () => {
  const el = document.createElement('play-export-dialog')
  assert.instanceOf(el, PlayExportDialog)
})
