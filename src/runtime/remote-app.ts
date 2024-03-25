import {
  CustomPostDefinition,
  UIEventHandlerDefinition,
  type Empty,
  type HandleUIEventRequest,
  type HandleUIEventResponse,
  type Metadata,
  type RenderPostRequest,
  type RenderPostResponse,
  type UIRequest,
  type UIResponse
} from '@devvit/protos'
import type {UIApp} from '@devvit/ui-renderer/client/ui-app.js'
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
  static new(gatewayOrigin: string, uploaded: () => Promise<Empty>): RemoteApp {
    const channel = createChannel(gatewayOrigin)
    const customPost = createClient(CustomPostDefinition, channel)
    const uiEventHandler = createClient(UIEventHandlerDefinition, channel)
    return new RemoteApp(
      <CustomPostNiceClient>(<unknown>customPost),
      <UIEventHandlerNiceClient>(<unknown>uiEventHandler),
      uploaded
    )
  }

  #customPost: CustomPostNiceClient
  #uiEventHandler: UIEventHandlerNiceClient
  #uploaded: () => Promise<Empty>

  constructor(
    customPost: CustomPostNiceClient,
    uiEventHandler: UIEventHandlerNiceClient,
    uploaded: () => Promise<Empty>
  ) {
    this.#customPost = customPost
    this.#uiEventHandler = uiEventHandler
    this.#uploaded = uploaded
  }

  async HandleUIEvent(
    req: Readonly<HandleUIEventRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<HandleUIEventResponse> {
    await this.#uploaded()
    return this.#uiEventHandler.handleUIEvent(req, {
      metadata: newNiceMeta(meta)
    })
  }

  async RenderPost(
    req: Readonly<RenderPostRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<RenderPostResponse> {
    await this.#uploaded()
    return this.#customPost.renderPost(req, {
      metadata: newNiceMeta(meta)
    })
  }

  async RenderPostContent(
    req: Readonly<UIRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<UIResponse> {
    await this.#uploaded()
    return this.#customPost.renderPostContent(req, {
      metadata: newNiceMeta(meta)
    })
  }

  async RenderPostComposer(
    req: Readonly<UIRequest>,
    meta: Readonly<Metadata> | undefined
  ): Promise<UIResponse> {
    await this.#uploaded()
    return this.#customPost.renderPostComposer(req, {
      metadata: newNiceMeta(meta)
    })
  }
}

function newNiceMeta(meta: Readonly<Metadata> | undefined): NiceMeta {
  return new NiceMeta(
    Object.entries(meta ?? {}).map(([key, {values}]) => [key, values.join()])
  )
}
