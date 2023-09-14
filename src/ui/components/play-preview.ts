import penWorker from '@devvit/previews/dist/pen.worker.min.js'
import type {LinkedBundle, Metadata} from '@devvit/protos'
import {BrowserLiteClient} from '@devvit/runtime-lite/BrowserLiteClient.js'
import {LitElement, css, html, type PropertyValueMap} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'

import '@devvit/previews/dist/devvit-preview.js'

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

  @property({attribute: false}) bundle?: LinkedBundle | undefined

  @state() private readonly _client: BrowserLiteClient = new BrowserLiteClient(
    new Blob([penWorker], {type: 'text/javascript'})
  )
  #meta: Metadata = {
    'devvit-app-user': {values: ['t2_appuser']},
    'devvit-subreddit': {values: ['t5_devvit']},
    'devvit-user': {values: ['t2_user']}
  }

  protected override async willUpdate(
    changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): Promise<void> {
    if (changedProperties.has('bundle') && this.bundle) {
      this._client.quit()
      try {
        await this._client.loadBundle(this.bundle)
      } catch (e) {
        console.error(e)
      }
      // to-do: fix hack to stimulate a reload.
      this.#meta = {...this.#meta}
      this.requestUpdate()
    }
  }

  override render() {
    return html`<div class="preview">
      ${this.bundle &&
      html`<devvit-preview
        .meta="${this.#meta}"
        .client=${this._client}
      ></devvit-preview>`}
    </div>`
  }
}
