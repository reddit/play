import {Devvit} from '@devvit/public-api'

function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

Devvit.addCustomPostType({
  name: 'Clock',
  render: context => {
    const [time, setTime] = context.useState(() => getCurrentTime())
    const tick = () => setTime(() => getCurrentTime())
    context.useInterval(tick, 1000).start()

    return (
      <vstack alignment='center middle' height={100}>
        <text size='xxlarge'>{time}</text>
      </vstack>
    )
  }
})

export default Devvit
