import {Devvit, useState} from '@devvit/public-api'

Devvit.addCustomPostType({
  name: 'Progress bar example',
  render: () => {
    const [progress, setProgress] = useState(30)
    return (
      <vstack
        alignment='center middle'
        height='100%'
        gap='medium'
        padding='large'
      >
        <vstack backgroundColor='#FFD5C6' cornerRadius='full' width='100%'>
          <hstack backgroundColor='#D93A00' width={`${progress}%`}>
            <spacer size='medium' shape='square' />
          </hstack>
        </vstack>
        <hstack gap='medium' width='100%'>
          <button
            icon='subtract-fill'
            width='50%'
            onPress={() => setProgress(progress => Math.max(progress - 10, 0))}
          />
          <button
            icon='add-fill'
            width='50%'
            onPress={() =>
              setProgress(progress => Math.min(progress + 10, 100))
            }
          />
        </hstack>
      </vstack>
    )
  }
})

export default Devvit
