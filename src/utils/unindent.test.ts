import {expect, test} from 'vitest'
import {unindent} from './unindent.js'

test('an indented program is unindented to the depth of the first nonblank line', () => {
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
  expect(unindent(src)).toMatchInlineSnapshot(`
    "import {Devvit} from '@devvit/public-api'

    Devvit.addCustomPostType({
      name: 'Say Hello',
      render: () => {
        return <text>Hello!</text>
      }
    })

    export default Devvit
    "
  `)
})
