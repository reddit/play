import type {LinkedBundle, SerializableServiceDefinition} from '@devvit/protos'

export function link(es: string): LinkedBundle {
  return {assets: {}, code: es, hostname: '', provides: provides(), uses: []}
}

function provides(): SerializableServiceDefinition[] {
  // Assume the app provides CustomPost and UIEventHandler services to avoid an
  // evaluation phase.
  return [
    {
      fullName: 'devvit.reddit.custom_post.v1alpha.CustomPost',
      methods: [
        {
          fullName: '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPost',
          name: 'RenderPost',
          requestStream: false,
          requestType: 'devvit.reddit.custom_post.v1alpha.RenderPostRequest',
          responseStream: false,
          responseType: 'devvit.reddit.custom_post.v1alpha.RenderPostResponse'
        }
      ],
      name: 'CustomPost',
      version: ''
    },
    {
      fullName: 'devvit.ui.events.v1alpha.UIEventHandler',
      methods: [
        {
          fullName: '/devvit.ui.events.v1alpha.UIEventHandler/HandleUIEvent',
          name: 'HandleUIEvent',
          requestStream: false,
          requestType: 'devvit.ui.events.v1alpha.HandleUIEventRequest',
          responseStream: false,
          responseType: 'devvit.ui.events.v1alpha.HandleUIEventResponse'
        }
      ],
      name: 'UIEventHandler',
      version: ''
    }
  ]
}
