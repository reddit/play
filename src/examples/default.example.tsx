import {Devvit} from '@devvit/public-api'

Devvit.addCustomPostType({
  name: 'Name',
  render: context => {
    return <blocks></blocks>
  }
})

export default Devvit
