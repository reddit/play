import {type Metadata} from '@devvit/protos/lib/Types.js'
import {
  CustomPostDefinition,
  type RenderPostRequest,
  type RenderPostResponse
} from '@devvit/protos/types/devvit/reddit/custom_post/v1alpha/custom_post.js'
import {
  type UIRequest,
  type UIResponse
} from '@devvit/protos/types/devvit/ui/block_kit/v1beta/ui.js'
import {
  UIEventHandlerDefinition,
  type HandleUIEventRequest,
  type HandleUIEventResponse
} from '@devvit/protos/types/devvit/ui/events/v1alpha/handle_ui.js'
import {type Empty} from '@devvit/protos/types/google/protobuf/empty.js'
import type {UIApp} from '@devvit/ui-renderer/client/dispatcher/remote-app.js'
import {
  Metadata as NiceMeta,
  createChannel,
  createClient,
  type CallOptions
} from 'nice-grpc-web'

// to-do: fix upstream ts-proto workarounds and ts-proto / nice-grpc-web
// integration typing (DX-5961). The definition types in @devvit/protos like
// CustomPostDefinition are simplified to workaround:
//
//   The inferred type of this node exceeds the maximum length the compiler will
//   serialize. An explicit type annotation is needed.ts(7056)
//
// Redefining the definitions in play gives the same error. However, even
// compilable definitions like UIEventHandlerDefinition generate incorrect
// client typing with nice-grpc-web.
type CustomPostNiceClient = {
  renderPost(
    req: Readonly<RenderPostRequest>,
    opts: Readonly<CallOptions>
  ): Promise<RenderPostResponse>
  renderPostComposer(
    req: Readonly<UIRequest>,
    opts: Readonly<CallOptions>
  ): Promise<UIResponse>
  renderPostContent(
    req: Readonly<UIRequest>,
    opts: Readonly<CallOptions>
  ): Promise<UIResponse>
}
type UIEventHandlerNiceClient = {
  handleUIEvent(
    req: Readonly<HandleUIEventRequest>,
    opts: Readonly<CallOptions>
  ): Promise<HandleUIEventResponse>
}

export class RemoteApp implements UIApp {
  /** @arg uploaded Callback to test whether remote bundle is available. */
  static new(
    gatewayOrigin: string,
    uploaded: () => Promise<Empty>,
    meta: Readonly<Metadata>
  ): RemoteApp {
    const channel = createChannel(gatewayOrigin)
    const customPost = createClient(CustomPostDefinition, channel)
    const uiEventHandler = createClient(UIEventHandlerDefinition, channel)
    return new RemoteApp(
      <CustomPostNiceClient>(<unknown>customPost),
      <UIEventHandlerNiceClient>(<unknown>uiEventHandler),
      uploaded,
      meta
    )
  }

  #customPost: CustomPostNiceClient
  #uiEventHandler: UIEventHandlerNiceClient
  #meta: Metadata
  #uploaded: () => Promise<Empty>

  constructor(
    customPost: CustomPostNiceClient,
    uiEventHandler: UIEventHandlerNiceClient,
    uploaded: () => Promise<Empty>,
    meta: Readonly<Metadata>
  ) {
    this.#customPost = customPost
    this.#uiEventHandler = uiEventHandler
    this.#uploaded = uploaded
    this.#meta = meta
  }

  #newNiceMeta(meta: Readonly<Metadata> | undefined): NiceMeta {
    return new NiceMeta(
      Object.entries({...this.#meta, ...meta}).map(([key, {values}]) => [
        key,
        values.join()
      ])
    )
  }

  async HandleUIEvent(
    req: Readonly<HandleUIEventRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<HandleUIEventResponse> {
    await this.#uploaded()
    return this.#uiEventHandler.handleUIEvent(req, {
      metadata: this.#newNiceMeta(meta)
    })
  }

  async RenderPost(
    req: Readonly<RenderPostRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<RenderPostResponse> {
    await this.#uploaded()
    return this.#customPost.renderPost(req, {
      metadata: this.#newNiceMeta(meta)
    })
  }

  async RenderPostContent(
    req: Readonly<UIRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<UIResponse> {
    await this.#uploaded()
    return this.#customPost.renderPostContent(req, {
      metadata: this.#newNiceMeta(meta)
    })
  }

  async RenderPostComposer(
    req: Readonly<UIRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<UIResponse> {
    await this.#uploaded()
    return this.#customPost.renderPostComposer(req, {
      metadata: this.#newNiceMeta(meta)
    })
  }
}
