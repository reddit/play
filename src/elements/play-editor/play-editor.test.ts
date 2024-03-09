import {assert, expect} from '@esm-bundle/chai'
import {LitElement, html, render, type TemplateResult} from 'lit'
import {newTSEnv} from '../../bundler/compiler.js'
import {PlayEditor} from './play-editor.js'

test('tag is defined', () => {
  const el = document.createElement('play-editor')
  assert.instanceOf(el, PlayEditor)
})

test('a slotted template emits an edit-template event', async () => {
  const edit = await new Promise<CustomEvent<string>>(async resolve => {
    document.body.addEventListener('edit-template', resolve)
    using _el = await fixture(
      'play-editor',
      html`
        <play-editor>
          <script lang="tsx" type="application/devvit">
            console.log('Hello World!')
          </script>
        </play-editor>
      `
    )
  })
  expect(edit.detail).equal("console.log('Hello World!')")
})

test('setSrc() replaces a template', async () => {
  using el = await fixture(
    'play-editor',
    html`
      <play-editor .env=${newTSEnv()}>
        <script lang="tsx" type="application/devvit">
          'abc'
        </script>
      </play-editor>
    `
  )
  await new Promise(resolve => requestAnimationFrame(resolve))
  const edit = await new Promise<CustomEvent<string>>(resolve => {
    el.addEventListener('edit', resolve)
    el.setSrc("'def'")
  })

  expect(edit.detail).equal("'def'")
})

async function fixture<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  template: TemplateResult
): Promise<HTMLElementTagNameMap[T] & Disposable> {
  const root = document.createElement('div')
  document.body.append(root)
  render(template, root)
  const el = root.getElementsByTagName<T>(tag)[0]!
  if (el == null) throw Error(`no element tagged "${tag}"`)
  if (el instanceof LitElement) await el.updateComplete
  ;(<Disposable>(<unknown>el))[Symbol.dispose] = () => root.remove()
  return <HTMLElementTagNameMap[T] & Disposable>el
}
