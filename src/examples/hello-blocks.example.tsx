import {Devvit, useState} from '@devvit/public-api'

Devvit.addCustomPostType({
  name: 'Say Hello',
  render: () => {
    const [counter, setCounter] = useState(0)
    return (
      <vstack alignment='center middle' height='100%' gap='large'>
        <text size='xxlarge' weight='bold'>
          Hello! 👋
        </text>
        <button
          appearance='primary'
          onPress={() => setCounter(counter => counter + 1)}
        >
          Click me!
        </button>
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
