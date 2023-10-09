import penWorker from '@devvit/previews/dist/pen.worker.min.js'
import type {LinkedBundle, Metadata} from '@devvit/protos'
import {BrowserLiteClient} from '@devvit/runtime-lite/BrowserLiteClient.js'
import {LitElement, css, html, type PropertyValues} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import {Bubble} from '../bubble.js'

import '@devvit/previews/dist/devvit-preview.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-preview': PlayPreview
  }
}

/**
 * The rendered output of Devvit program under various parameters.
 * @fires {PreviewError} error
 * @fires {undefined} clear-errors
 * @fires {unknown} devvit-ui-error
 */
@customElement('play-preview')
export class PlayPreview extends LitElement {
  static override get styles() {
    return css`
      .preview {
        /* Hide overflow on corners */
        overflow: hidden;
        border-width: 1px;
        border-style: solid;
        border-color: var(--color-neutral-border);
        border-radius: 16px;
        min-height: 320px;
        box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.25);

        /* to-do: adjust these colors to the theme. */
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
  }

  @property({attribute: false}) bundle: Readonly<LinkedBundle> | undefined
  @property({type: Number}) previewWidth?: number
  @property() scheme?: ColorScheme

  @state() private readonly _client: BrowserLiteClient = new BrowserLiteClient(
    new Blob([penWorker], {type: 'text/javascript'}),
    (type, err) => this.dispatchEvent(Bubble('error', {type, err}))
  )
  #meta: Metadata = {
    'devvit-app-user': {values: ['t2_appuser']},
    'devvit-subreddit': {values: ['t5_devvit']},
    'devvit-user': {values: ['t2_user']}
  }

  async reset(): Promise<void> {
    if (!this.bundle) return
    this._client.quit()
    this.dispatchEvent(Bubble('clear-errors', undefined))
    try {
      await this._client.loadBundle(this.bundle)
    } catch (err) {
      this.dispatchEvent(Bubble('error', {type: 'Error', err}))
    }
    // Re-render the preview.
    this.#meta = {...this.#meta}
    this.requestUpdate()
  }

  override disconnectedCallback(): void {
    this._client.quit()
    super.disconnectedCallback()
  }

  protected override render() {
    // to-do: don't override toaster's --rem16 to offset the toast. Upstream a
    // variable.
    return html`<div class="preview">
      ${this.bundle &&
      html`<devvit-preview
        @devvit-ui-error=${(ev: CustomEvent<unknown>) =>
          this.dispatchEvent(Bubble('error', {type: 'Error', err: ev.detail}))}
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
