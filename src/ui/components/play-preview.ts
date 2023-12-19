import penWorker from '@devvit/previews/dist/pen.worker.min.js'
import type { LinkedBundle, Metadata } from '@devvit/protos'
import { BrowserLiteClient } from '@devvit/runtime-lite/BrowserLiteClient.js'
import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { ColorScheme } from '../../types/color-scheme.js'
import { Bubble } from '../bubble.js'

import '@devvit/previews/dist/devvit-preview.js'
import type { PreviewError } from '../../types/preview-error.js'

declare global {
  interface HTMLElementEventMap {
    error: PreviewError
    'clear-errors': undefined
    'devvit-ui-error': unknown
  }
  interface HTMLElementTagNameMap {
    'play-preview': PlayPreview
  }
}

function debounce(fn: Function, ms = 1000) {
  let timeoutId: NodeJS.Timeout;
  return function (this: any, ...args:any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

let socket: WebSocket;
let sendCount = 0;
function initSocket(): void {
  console.log('Initializing Socket for client updates');
  if (socket) return;
  sendCount = 0

  // Can't use server events due to CORS
  try {
    socket = new WebSocket('ws://localhost:5678');
  } catch (err) {
    console.log('playtest unable to connect.' );
    return;
  }

  socket.onopen = () => {
    console.log('playtest connected.');
  };

  socket.onclose = () => {
    console.log( 'playtest disconnected.');
  };

  socket.onmessage = ev => {
    const msg = JSON.parse(ev.data);
    console.log(msg);
    // to-do: filter on install ID and pre-release versions so updates only
    // trigger where relevant.

  };
}

const updateBundle = debounce((bundle: Readonly<LinkedBundle> | undefined) => sendNewBundle(bundle))

function sendNewBundle(bundle: Readonly<LinkedBundle> | undefined) {
  sendCount++;
  console.log('send count: ', sendCount);
  if (socket && socket.readyState == socket.OPEN) {
    try {
      console.log('sending new bundle');
      socket.send(JSON.stringify(bundle));
    } catch (err) {
      console.error('Failed to send new bundle');
    }
  }
}

/** The rendered output of Devvit program under various parameters. */
@customElement('play-preview')
export class PlayPreview extends LitElement {
  static override styles: CSSResultGroup = css`
    .preview {
      /* Hide overflow on corners */
      overflow: hidden;
      border-width: var(--border-width);
      border-style: solid;
      border-color: var(--color-neutral-border);
      border-radius: 16px;
      min-height: 320px;
      box-shadow: var(--shadow-xs);

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

  @property({ attribute: false }) bundle: Readonly<LinkedBundle> | undefined
  @property({ type: Number }) previewWidth?: number
  @property() scheme?: ColorScheme

  @state() private readonly _client: BrowserLiteClient = new BrowserLiteClient(
    new Blob([penWorker], { type: 'text/javascript' }),
    (type, err) => this.dispatchEvent(Bubble('error', { type, err }))
  )
  #meta: Metadata = {
    'devvit-app-user': { values: ['t2_appuser'] },
    'devvit-subreddit': { values: ['t5_devvit'] },
    'devvit-user': { values: ['t2_user'] }
  }

  constructor() {
    super()
    initSocket()
  }

  async reset(): Promise<void> {
    if (!this.bundle) return
    this._client.quit()
    this.dispatchEvent(Bubble('clear-errors', undefined))
    try {
      await this._client.loadBundle(this.bundle)
    } catch (err) {
      this.dispatchEvent(Bubble('error', { type: 'Error', err }))
    }
    // Re-render the preview.
    this.#meta = { ...this.#meta }
    this.requestUpdate()
  }

  override disconnectedCallback(): void {
    this._client.quit()
    super.disconnectedCallback()
  }

  protected override render(): TemplateResult {
    console.log("Updating render")
    updateBundle(this.bundle)
    // to-do: don't override toaster's --rem16 to offset the toast. Upstream a
    // variable.
    return html`<div class="preview">
      ${this.bundle &&
      html`<devvit-preview
        @devvit-ui-error=${(ev: CustomEvent<unknown>) =>
          this.dispatchEvent(Bubble('error', { type: 'Error', err: ev.detail }))}
        .meta="${this.#meta}"
        .client=${this._client}
        .scheme=${this.scheme}
        style="--rem16: 50px;"
      ></devvit-preview>`}
    </div>`
  }

  protected override async willUpdate(
    props: PropertyValues<this>
  ): Promise<void> {
    if (props.has('bundle')) await this.reset()
    else this.requestUpdate()
  }
}
