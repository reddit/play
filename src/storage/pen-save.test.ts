import {expect, test} from 'vitest'
import {PenSave, loadPen, savePen} from './pen-save.js'

test.each([
  ['missing hash', ''],
  ['empty hash', '#'],
  ['empty pen', '#pen/'],
  [
    'unknown version',
    (() => {
      const location = <Location>{
        hash: '',
        replace(url: string) {
          this.hash = url
        }
      }
      savePen(location, undefined, {name: '', src: '', version: <1>99})
      return location.hash
    })()
  ],
  ['malformed pen', '#pen123']
])('%s is parsed gracefully', (_, hash) =>
  expect(loadPen(<Location>{hash})).toBe(undefined)
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
  const location = <Location>{
    hash: '',
    replace(url: string) {
      this.hash = url
    }
  }
  savePen(location, undefined, PenSave('Hello World!', src))
  expect(loadPen(location)).toMatchInlineSnapshot(`
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
