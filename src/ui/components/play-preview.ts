import penWorker from '@devvit/previews/dist/pen.worker.min.js'
import {BrowserLiteClient} from '@devvit/runtime-lite/BrowserLiteClient.js'
import {LitElement, css, html} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {SourceChanged} from '../events.js'

import '@devvit/previews/dist/devvit-preview.js'
import type {Metadata} from '@devvit/protos'
import {appEntrypointFilename, compile} from '../../bundler/compiler.js'
import {link} from '../../bundler/linker.js'
import type {Pen} from '../../types/pen.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-preview': PlayPreview
  }
}

/** The rendered output of Devvit program under various parameters. */
@customElement('play-preview')
export class PlayPreview extends LitElement {
  static override get styles() {
    return css`
      :host {
        background: #c8ccd1;
      }
      .preview {
        /* Hide overflow on corners */
        overflow: hidden;
        border-width: 1px;
        border-style: solid;
        border-color: #72777d;
        border-radius: 8px;
        min-height: 320px;

        /* When the background is visible, the preview is loading. */
        background-color: #f8f9fa;
        background: #f8f9fa
          repeating-linear-gradient(
            -45deg,
            #f8f9fa,
            #f8f9fa 18px,
            #eaecf080 18px,
            #eaecf080 32px
          )
          0 / 200%;
        box-shadow: 2px 2px 2px 0 rgba(0, 0, 0, 0.1) inset;
      }
    `
  }

  @property({attribute: false}) pen!: Pen

  @state() private readonly _client: BrowserLiteClient = new BrowserLiteClient(
    new Blob([penWorker], {type: 'text/javascript'})
  )
  #meta: Metadata = {
    'devvit-app-user': {values: ['t2_appuser']},
    'devvit-subreddit': {values: ['t5_devvit']},
    'devvit-user': {values: ['t2_user']}
  }

  override connectedCallback() {
    super.connectedCallback()
    globalThis.addEventListener(
      SourceChanged,
      <(event: Event) => void>(<unknown>this.#onSourceChanged)
    )
  }

  override disconnectedCallback() {
    globalThis.removeEventListener(
      SourceChanged,
      <(event: Event) => void>(<unknown>this.#onSourceChanged)
    )
    super.disconnectedCallback()
  }

  override render() {
    return html`<div class="preview">
      ${this.pen.bundle &&
      html`<devvit-preview
        .meta="${this.#meta}"
        .client=${this._client}
      ></devvit-preview>`}
    </div>`
  }

  #onSourceChanged = async (ev: CustomEvent<{src: string}>): Promise<void> => {
    this.pen.env.updateFile(appEntrypointFilename, ev.detail.src)
    const build = link(compile(this.pen.env))

    this._client.quit()
    try {
      await this._client.loadBundle(build)
    } catch (e) {
      console.error(e)
    }
    this.pen.bundle = build
    // to-do: fix hack to stimulate a reload.
    this.#meta = {...this.#meta}
    this.requestUpdate()
  }
}
