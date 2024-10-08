import {Devvit, useState} from '@devvit/public-api'

type Tally = [option: string, votes: number]
const tallies: readonly Tally[] = [
  ['Yes', 512],
  ['No', 42],
  ['Maybe', 128]
]

function findWinningTally(): Tally {
  let max: Tally | null = null
  for (const tally of tallies) {
    if (!max || tally[1] > max[1]) {
      max = tally
    }
  }
  if (max === null) {
    throw new Error('No tally found.')
  }
  return max
}

const Header = () => (
  <vstack>
    <hstack height='32px' alignment='middle'>
      <spacer size='medium' />
      <text size='small' weight='bold' color='neutral-content'>
        Open
      </text>
      <spacer size='small' />
      <text size='small' weight='bold' color='neutral-content-weak'>
        •
      </text>
      <spacer size='small' />
      <text size='small' weight='bold' color='neutral-content-weak'>
        5.6k votes
      </text>
    </hstack>
    <hstack height='1px' />
  </vstack>
)

const Footer = (props: {children?: Devvit.ElementChildren}) => (
  <hstack gap='small' alignment='middle' padding='medium' height='32px'>
    {props.children ?? null}
    <text color='neutral-content-weak' size='small'>
      15 hours 11 minutes left
    </text>
  </hstack>
)

Devvit.addCustomPostType({
  name: 'Polls Example',
  height: 'tall',
  render: () => {
    const [selection, setSelection] = useState('')
    const [hasVoted, setHasVoted] = useState(false)

    const VotingScreen = (
      <vstack padding='medium' alignment='start' gap='medium' grow>
        {tallies.map(([option, _value]) => (
          <hstack
            alignment='middle'
            height='28px'
            onPress={() => setSelection(option)}
          >
            <spacer size='xsmall' />
            <icon
              name={
                selection === option
                  ? 'radio-button-fill'
                  : 'radio-button-outline'
              }
            />
            <spacer size='small' />
            <spacer size='xsmall' />
            <text>{option}</text>
          </hstack>
        ))}
      </vstack>
    )

    const total = tallies.reduce((acc, current) => acc + current[1], 0)
    const winningOption = findWinningTally()
    const ResultsScreen = (
      <vstack alignment='start' gap='small' padding='medium' grow>
        {tallies.map(([option, value]) => {
          const percentage = Math.round((value / total) * 100)
          return (
            <zstack width='100%'>
              <hstack
                height='100%'
                width={`${percentage}%`}
                borderColor={
                  winningOption[0] === option
                    ? 'rgba(255,0,0,0.2)'
                    : 'secondary-background'
                }
                cornerRadius='small'
              />
              <zstack gap='small' alignment='middle' padding='small'>
                <text weight='bold'>{value}</text>
                <hstack>
                  <spacer width='56px' />
                  <text>{option}</text>
                </hstack>
              </zstack>
            </zstack>
          )
        })}
      </vstack>
    )

    return (
      <vstack height='100%'>
        <Header />
        {hasVoted ? ResultsScreen : VotingScreen}
        <Footer>
          {!hasVoted && (
            <button
              appearance='primary'
              size='small'
              disabled={!selection}
              onPress={() => setHasVoted(true)}
            >
              Vote
            </button>
          )}
        </Footer>
      </vstack>
    )
  }
})

export default Devvit
