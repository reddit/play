/**
 * @vitest-environment jsdom
 */

import {expect, test} from 'vitest'
import {type FilePickerType, flattenAcceptTypes} from './file-access-api.js'

test('can convert from File Access API types to flat input types', () => {
  const types: FilePickerType[] = [
    {
      description: 'Lossless image',
      accept: {
        'image/png': ['*.png'],
        'image/bmp': ['*.bmp', '*.dib']
      }
    },
    {
      description: 'Lossy image',
      accept: {
        'image/jpeg': ['*.jpg', '*.jpeg', '*.jpe', '*.jfif'],
        'image/gif': ['*.gif']
      }
    }
  ]
  const flattened = flattenAcceptTypes(types)
  expect(flattened).toEqual(
    'image/png,*.png,image/bmp,*.bmp,*.dib,image/jpeg,*.jpg,*.jpeg,*.jpe,*.jfif,image/gif,*.gif'
  )
})
