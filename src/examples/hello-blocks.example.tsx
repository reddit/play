import {Devvit} from '@devvit/public-api'

Devvit.addCustomPostType({
  name: 'Say Hello',
  render: ctx => {
    const [counter, setCounter] = ctx.useState(0)
    return (
      <vstack alignment='center middle' height={100}>
        <hstack alignment='center middle' gap='medium' padding='medium'>
          <text size='xxlarge' style='heading'>
            Hello! 👋
          </text>
          <button
            appearance='primary'
            onPress={() => setCounter(counter => counter + 1)}
          >
            Click me!
          </button>
        </hstack>
        {counter ? (
          <text>{`You clicked ${counter} time(s)!`}</text>
        ) : (
          <text>&nbsp;</text>
        )}
      </vstack>
    )
  }
})

export default Devvit
