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
          responseStream: false,
          requestType: 'devvit.reddit.custom_post.v1alpha.RenderPostRequest',
          responseType: 'devvit.reddit.custom_post.v1alpha.RenderPostResponse'
        },
        {
          fullName:
            '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostContent',
          name: 'RenderPostContent',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.ui.block_kit.v1beta.UIRequest',
          responseType: 'devvit.ui.block_kit.v1beta.UIResponse'
        },
        {
          fullName:
            '/devvit.reddit.custom_post.v1alpha.CustomPost/RenderPostComposer',
          name: 'RenderPostComposer',
          requestStream: false,
          responseStream: false,
          requestType: 'devvit.ui.block_kit.v1beta.UIRequest',
          responseType: 'devvit.ui.block_kit.v1beta.UIResponse'
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
          responseStream: false,
          requestType: 'devvit.ui.events.v1alpha.HandleUIEventRequest',
          responseType: 'devvit.ui.events.v1alpha.HandleUIEventResponse'
        }
      ],
      name: 'UIEventHandler',
      version: ''
    }
  ]
}
