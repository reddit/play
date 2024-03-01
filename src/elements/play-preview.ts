// @ts-expect-error
import * as penWorker from '@devvit/previews/dist/pen.worker.min.js'

import type {LinkedBundle, Metadata} from '@devvit/protos'
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
import type {ColorScheme} from '../types/color-scheme.js'
import {Bubble} from '../utils/bubble.js'

import '@devvit/previews/dist/devvit-preview.js'
import {cssReset} from '../utils/css-reset.js'

const localRuntimeCode: Blob = new Blob([penWorker.default], {
  type: 'text/javascript'
})

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
  @property() scheme?: ColorScheme

  @state() private _err = false

  #meta: Metadata = {
    'devvit-app-user': {values: ['t2_appuser']},
    'devvit-subreddit': {values: ['t5_sub']},
    'devvit-user': {values: ['t2_user']}
  }

  protected override render(): TemplateResult {
    // to-do: don't override toaster's --rem16 to offset the toast. Upstream a
    // variable.
    return html`
      <div class="preview">
        ${this.bundle && !this._err
          ? html`
              <devvit-preview
                .bundle=${this.bundle}
                .localRuntimeCode=${localRuntimeCode}
                .metadata=${this.#meta}
                .scheme=${this.scheme}
                style="--rem16: 50px;"
                ?use-experimental-blocks=${true}
                ?use-sandbox=${false}
                @devvit-ui-error=${() => (this._err = true)}
              ></devvit-preview>
            `
          : nothing}
      </div>
    `
  }

  protected override async willUpdate(
    props: PropertyValues<this>
  ): Promise<void> {
    super.willUpdate(props)
    if (props.has('bundle')) {
      this._err = false
      this.dispatchEvent(Bubble<undefined>('clear-errors', undefined))
    }
  }
}
