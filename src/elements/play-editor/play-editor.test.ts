import {assert, expect} from '@esm-bundle/chai'
import {html, render} from 'lit'
import {PlayEditor} from './play-editor.js'

test('tag is defined', () => {
  const el = document.createElement('play-editor')
  assert.instanceOf(el, PlayEditor)
})

test('a slotted template emits an edit-template event', async () => {
  render(
    html`
      <play-editor>
        <script lang="tsx" type="application/devvit">
          console.log('Hello World!')
        </script>
      </play-editor>
    `,
    document.body
  )
  const el = document.querySelector<PlayEditor>('play-editor')!

  const edit = await new Promise<CustomEvent<string>>(async resolve => {
    el.addEventListener('edit-template', resolve)
  })
  expect(edit.detail).equal("console.log('Hello World!')")
})
