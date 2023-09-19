import {expect, test} from 'vitest'
import {PenSave, loadPen, savePen} from './pen-save.js'

test.each([
  ['missing hash', ''],
  ['empty hash', '#'],
  ['empty pen', '#pen/'],
  [
    'unknown version',
    (() => {
      const location = {hash: ''}
      savePen(location, undefined, {name: '', src: '', version: <1>99})
      return location.hash
    })()
  ],
  ['malformed pen', '#pen123']
])('%s is parsed gracefully', (_, hash) =>
  expect(loadPen({hash}, undefined)).toBe(undefined)
)

test('hello world can be parsed', () => {
  const src = `
    import {Devvit} from '@devvit/public-api'

    Devvit.addCustomPostType({
      name: 'Say Hello',
      render: () => {
        return <text>Hello!</text>
      }
    })

    export default Devvit
  `
  const location = {hash: ''}
  savePen(location, undefined, PenSave('Hello World!', src))
  expect(loadPen(location, undefined)).toMatchInlineSnapshot(`
    {
      "name": "Hello World!",
      "src": "
        import {Devvit} from '@devvit/public-api'

        Devvit.addCustomPostType({
          name: 'Say Hello',
          render: () => {
            return <text>Hello!</text>
          }
        })

        export default Devvit
      ",
      "version": 1,
    }
  `)
})
