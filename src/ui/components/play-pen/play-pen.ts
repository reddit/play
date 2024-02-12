import type {LinkedBundle} from '@devvit/protos'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import {
  LitElement,
  css,
  html,
  unsafeCSS,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {ifDefined} from 'lit/directives/if-defined.js'
import {
  appEntrypointFilename,
  compile,
  newTSEnv,
  setSource
} from '../../../bundler/compiler.js'
import {link} from '../../../bundler/linker.js'
import clock from '../../../examples/clock.example.js'
import defaultExample from '../../../examples/default.example.js'
import helloBlocks from '../../../examples/hello-blocks.example.js'
import polls from '../../../examples/polls.example.js'
import progressBar from '../../../examples/progress-bar.example.js'
import svg from '../../../examples/svg.example.js'
import type {ColorScheme} from '../../../types/color-scheme.js'
import type {Diagnostics} from '../../../types/diagnostics.js'
import {PenSave, loadPen, penToHash, savePen} from '../../../types/pen-save.js'
import {throttle} from '../../../utils/throttle.js'
import type {OpenLine} from '../play-console.js'
import type {PlayEditor} from '../play-editor/play-editor.js'
import type {PlayPreview} from '../play-preview.js'
import type {PlayToast} from '../play-toast.js'
import penVars from './pen-vars.css'
import type {DevvitUIError} from '@devvit/previews/dist/devvit-blocks-preview.js'

import '../play-editor/play-editor.js'
import '../play-pen-footer.js'
import '../play-pen-header.js'
import '../play-preview-controls.js'
import '../play-preview.js'
import '../play-toast.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen': PlayPen
  }
}

/**
 * A complete and standalone playground: an editor, a runtime and client, a
 * preview and toolbar. Accepts a slotted template.
 *
 * @slot - Optional template.
 */
@customElement('play-pen')
export class PlayPen extends LitElement {
  static override styles: CSSResultGroup = css`
    ${unsafeCSS(penVars)}

    :host {
      /* Light mode. */
      color: var(--color-foreground);
      background-color: var(--color-background);

      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;

      /* Dark and light schemes are supported. */
      color-scheme: dark light;
    }

    play-editor {
      width: 100%;
      flex-grow: 1;
      flex-shrink: 1;
    }

    .preview {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      row-gap: 8px;
    }

    main {
      column-gap: 16px;
      display: flex;
      flex-direction: row;
      overflow: clip;
      padding-right: 16px;
      padding-left: 16px;
      row-gap: 16px;
      height: 100%;
      background-color: var(--color-background);
      z-index: var(--z-base);
    }

    /* Makes dropdowns appear over other content */
    play-pen-header,
    play-pen-footer {
      z-index: var(--z-menu);
    }
  `

  /**
   * Allow loading and saving from LocalStorage. Do not enable for multiple
   * playgrounds on the same document.
   */
  @property({attribute: 'allow-storage', type: Boolean}) allowStorage: boolean =
    false
  /**
   * Allow loading and saving from URL hash. Loading from hash has precedence
   * over LocalStorage. Do not enable for multiple playgrounds on the same
   * document.
   */
  @property({attribute: 'allow-url', type: Boolean}) allowURL: boolean = false
  @property({attribute: false}) srcByLabel: Readonly<{[key: string]: string}> =
    {
      Default: defaultExample, // The default can be overridden by the slot.
      'Hello Blocks!': helloBlocks,
      'Progress Bar': progressBar,
      Clock: clock,
      Polls: polls,
      SVG: svg
    }

  /** Program executable. */
  @state() private _bundle?: Readonly<LinkedBundle> | undefined
  /** Execution preview widths. */
  @state() private _previewWidth: number = 288
  @state() private _diagnostics: Diagnostics = {previewErrs: [], tsErrs: []}
  @query('play-editor') private _editor!: PlayEditor
  @query('play-preview') private _preview!: PlayPreview
  @query('play-toast') private _toast!: PlayToast
  readonly #env: VirtualTypeScriptEnvironment = newTSEnv()

  /** Program title. */ @state() private _name: string = ''
  /** Execution color scheme. */ @state() private _scheme:
    | ColorScheme
    | undefined
  /** Program source code. Undefined when not restored. */ @state()
  private _src: string | undefined
  #template?: boolean

  override connectedCallback(): void {
    super.connectedCallback()

    let pen
    if (this.allowURL) pen = loadPen(location)
    if (this.allowStorage) pen ??= loadPen(localStorage)
    if (!pen) {
      this.#template = true
      this.#setSrc(helloBlocks, false)
      return
    }
    this.#setSrc(pen.src, false)
    this.#setName(pen.name, false)
  }

  protected override render(): TemplateResult {
    return html`
      <play-toast>Copied the URL!</play-toast
      ><play-pen-header
        name=${this._name}
        .srcByLabel=${this.srcByLabel}
        url=${this.#shareURL().toString()}
        @edit-name=${(ev: CustomEvent<string>) =>
          this.#setName(ev.detail, true)}
        @edit-src=${(ev: CustomEvent<string>) => {
          this.#setSrc(ev.detail, false)
          this.#setName('', false)
          this._editor.setSrc(ev.detail)
        }}
        @share=${this.#onShare}
      ></play-pen-header>
      <main>
        <play-editor
          .env=${this.#env}
          src=${ifDefined(this._src)}
          @edit=${(ev: CustomEvent<string>) => this.#setSrc(ev.detail, true)}
          @edit-template=${(ev: CustomEvent<string>) => {
            this.srcByLabel = {...this.srcByLabel, ['Default']: ev.detail}
            if (!this.#template) return
            // If no source was restored, use the template.
            this.#setSrc(ev.detail, false)
            this._editor.setSrc(ev.detail)
          }}
          ><slot></slot
        ></play-editor>
        <div class="preview">
          <play-preview
            .bundle=${this._bundle}
            previewWidth=${this._previewWidth}
            scheme=${ifDefined(this._scheme)}
            @clear-errors=${() => this.#clearPreviewErrors()}
            @devvit-ui-error=${(ev: CustomEvent<DevvitUIError>) =>
              this.#appendPreviewError(ev.detail)}
          ></play-preview>
          <play-preview-controls
            previewWidth=${this._previewWidth}
            scheme=${ifDefined(this._scheme)}
            @preview-reset=${() => this._preview.reset()}
            @preview-width=${(ev: CustomEvent<number>) =>
              (this._previewWidth = ev.detail)}
            @preview-scheme=${(ev: CustomEvent<ColorScheme | undefined>) =>
              (this._scheme = ev.detail)}
          ></play-preview-controls>
        </div>
      </main>
      <play-pen-footer
        .diagnostics=${this._diagnostics}
        @preview-width=${(ev: CustomEvent<number>) =>
          (this._previewWidth = ev.detail)}
        @preview-scheme=${(ev: CustomEvent<ColorScheme | undefined>) =>
          (this._scheme = ev.detail)}
        @open-line=${(ev: CustomEvent<OpenLine>) =>
          this._editor.openLine(ev.detail.line, ev.detail.char)}
      ></play-pen-footer>
    `
  }

  #appendPreviewError(err: DevvitUIError): void {
    this._diagnostics = {
      ...this._diagnostics,
      previewErrs: [...this._diagnostics.previewErrs, err]
    }
  }

  #clearPreviewErrors(): void {
    if (this._diagnostics) this._diagnostics.previewErrs.length = 0
    this._diagnostics = {...this._diagnostics}
  }

  async #onShare(): Promise<void> {
    await navigator.clipboard.writeText(this.#shareURL().toString())
    this._toast.open()
  }

  /** Save to LocalStorage and URL as allowed. */
  #save(): void {
    savePen(
      this.allowURL ? location : undefined,
      this.allowStorage ? localStorage : undefined,
      PenSave(this._name, this._src ?? '')
    )
  }

  #setName(name: string, save: boolean): void {
    this._name = name
    if (save) this.#save()
  }

  #setSrc(src: string, save: boolean): void {
    this._src = src
    setSource(this.#env, src)
    this.#env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
    this._diagnostics = {
      ...this._diagnostics,
      tsErrs: this.#env.languageService.getSemanticDiagnostics(
        appEntrypointFilename
      )
    }
    this.#setSrcSideEffects(save)
  }

  /** Throttled changes after updating sources. */
  #setSrcSideEffects = throttle((save: boolean) => {
    this._bundle = link(compile(this.#env))
    if (save) this.#save()
  }, 500)

  /** Recompute the current hash regardless of the location bar state. */
  #shareURL(): URL {
    const url = new URL(location.toString())
    url.hash = penToHash(PenSave(this._name, this._src ?? ''))
    return url
  }
}
