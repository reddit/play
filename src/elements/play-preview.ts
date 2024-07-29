// @ts-expect-error
import * as sandboxedRuntimeScript from '@devvit/previews/dist/sandboxed-pen.worker.min.js'
// @ts-expect-error
import * as unsandboxedRuntimeScript from '@devvit/previews/dist/unsandboxed-pen.worker.min.js'

import {type Metadata} from '@devvit/protos/lib/Types.js'
import type {LinkedBundle} from '@devvit/protos/types/devvit/runtime/bundle.js'
import {type Empty} from '@devvit/protos/types/google/protobuf/empty.js'
import {
  LitElement,
  css,
  html,
  nothing,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {RemoteApp} from '../runtime/remote-app.js'
import {defaultSettings} from '../storage/settings-save.js'
import type {ColorScheme} from '../types/color-scheme.js'
import {Bubble} from '../utils/bubble.js'
import {cssReset} from '../utils/css-reset.js'

import '@devvit/previews/dist/devvit-preview.js'

const sandboxedRuntimeBlob: Blob = new Blob([sandboxedRuntimeScript.default], {
  type: 'text/javascript'
})
const unsandboxedRuntimeBlob: Blob = new Blob(
  [unsandboxedRuntimeScript.default],
  {type: 'text/javascript'}
)

declare global {
  interface HTMLElementEventMap {
    'clear-errors': CustomEvent<undefined>
  }
  interface HTMLElementTagNameMap {
    'play-preview': PlayPreview
  }
}

/** The rendered output of Devvit program under various parameters. */
@customElement('play-preview')
export class PlayPreview extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    .preview {
      /* Hide overflow on corners */
      overflow: hidden;
      border-width: var(--border-width);
      border-style: solid;
      border-color: var(--color-neutral-border);
      border-radius: 16px;
      min-height: 320px;
      box-shadow: var(--shadow-xs);
      /* Prevents the border from throwing off the context.dimensions calculation */
      box-sizing: content-box;

      /* When the background is visible, the preview is loading. */
      background-color: var(--color-interactive-background);
      background-image: repeating-linear-gradient(
        -45deg,
        var(--color-interactive-background),
        var(--color-interactive-background) 18px,
        var(--color-interactive-background-disabled) 18px,
        var(--color-interactive-background-disabled) 32px
      );
      background-position-x: 0;
      background-position-y: 200%;
      min-width: 288px;
      transition-duration: 0.2s;
      transition-property: width;
      transition-timing-function: ease-out;
    }

    :host([previewWidth='288']) .preview {
      width: 288px;
    }
    :host([previewWidth='343']) .preview {
      width: 343px;
    }
    :host([previewWidth='400']) .preview {
      width: 400px;
    }
    :host([previewWidth='512']) .preview {
      width: 512px;
    }
    :host([previewWidth='718']) .preview {
      width: 718px;
    }
  `

  @property({attribute: false}) bundle: Readonly<LinkedBundle> | undefined
  @property({type: Number}) previewWidth?: number
  @property({attribute: 'remote-runtime-origin'}) remoteRuntimeOrigin: string =
    defaultSettings.remoteRuntimeOrigin
  @property({attribute: 'runtime-debug-logging', type: Boolean})
  runtimeDebugLogging: boolean = false
  @property({attribute: 'sandbox-app', type: Boolean})
  sandboxApp: boolean = false
  @property() scheme?: ColorScheme
  @property({attribute: false}) uploaded: Promise<Empty> | undefined
  @property({attribute: 'use-experimental-blocks', type: Boolean})
  useExperimentalBlocks: boolean = false
  @property({attribute: 'use-local-runtime', type: Boolean})
  useLocalRuntime: boolean = false
  @property({attribute: 'use-remote-runtime', type: Boolean})
  useRemoteRuntime: boolean = false
  @property({attribute: 'use-speculative-execution', type: Boolean})
  useSpeculativeExecution: boolean = false
  @property({attribute: 'use-ui-request', type: Boolean})
  useUIRequest: boolean = false

  @state() private _err = false

  #meta: Metadata = {
    'actor-id': {values: []}, // Set in willUpdate().
    'devvit-actor': {values: ['main']},
    'devvit-app': {values: ['pen']},
    'devvit-app-user': {values: ['t2_123']},
    'devvit-r2-host': {values: ['oauth.reddit.com']},
    'devvit-installation': {values: ['123']},
    'devvit-subreddit': {values: ['t5_123']},
    'devvit-user': {values: ['t2_123']},
    'devvit-user-agent': {values: ['play']}
  }
  #remote: RemoteApp | undefined

  protected override render(): TemplateResult {
    // to-do: don't override toaster's --rem16 to offset the toast. Upstream a
    // variable.
    return html`
      <div class="preview">
        ${this.bundle && !this._err
          ? html`
              <devvit-preview
                .bundle=${this.bundle}
                .localRuntimeCode=${this.useLocalRuntime
                  ? this.sandboxApp
                    ? sandboxedRuntimeBlob
                    : unsandboxedRuntimeBlob
                  : undefined}
                .metadata=${this.#meta}
                .remote=${this.useRemoteRuntime ? this.#remote : undefined}
                .scheme=${this.scheme}
                post-id="t3_123"
                ?runtime-debug-logging=${this.runtimeDebugLogging}
                style="--rem16: 50px;"
                ?use-experimental-blocks=${this.useExperimentalBlocks}
                ?use-ui-request=${this.useUIRequest}
                ?use-speculative-execution=${this.useSpeculativeExecution}
                @devvit-ui-error=${() => (this._err = true)}
                @devvit-image-upload=${mockImageUpload}
              ></devvit-preview>
            `
          : nothing}
      </div>
    `
  }

  protected override willUpdate(props: PropertyValues<this>): void {
    super.willUpdate(props)
    if (props.has('bundle')) {
      this._err = false
      if (this.bundle) this.#meta['actor-id']!.values = [this.bundle.hostname]
      this.dispatchEvent(Bubble<undefined>('clear-errors', undefined))
    }
    if (props.has('remoteRuntimeOrigin'))
      this.#remote = RemoteApp.new(
        this.remoteRuntimeOrigin,
        () => this.uploaded ?? Promise.resolve({}),
        this.#meta
      )
  }
}

const mockImageUpload = (
  event: CustomEvent<{
    blob: Blob
    uploadRequest: Promise<UploadResponse> | null
  }>
): void => {
  event.detail.uploadRequest = new Promise(resolve => {
    setTimeout(() => {
      resolve({
        url: 'https://i.redd.it/m04iwd26jbpc1.png',
        mediaId: 'm04iwd26jbpc1'
        // error:'Whoops!' // uncomment to emulate the error response
      })
    }, 2000)
  })
}

type UploadResponse = {
  url?: string
  mediaId?: string
  error?: string
}
