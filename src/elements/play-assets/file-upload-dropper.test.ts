import {assert} from '@esm-bundle/chai'
import {FileUploadDropper} from './file-upload-dropper'

test('tag is defined', () => {
  const el = document.createElement('file-upload-dropper')
  assert.instanceOf(el, FileUploadDropper)
})
