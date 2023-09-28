import type {LinkedBundle} from '@devvit/protos'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import {LitElement, css, html} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {ifDefined} from 'lit/directives/if-defined.js'
import {
  appEntrypointFilename,
  compile,
  newTSEnv,
  setSource
} from '../../bundler/compiler.js'
import {link} from '../../bundler/linker.js'
import blocksGallery from '../../examples/blocks-gallery.example.js'
import clock from '../../examples/clock.example.js'
import helloBlocks from '../../examples/hello-blocks.example.js'
import progressBar from '../../examples/progress-bar.example.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import type {Diagnostics} from '../../types/diagnostics.js'
import type {PreviewError} from '../../types/preview-error.js'
import {PenSave, loadPen, penToHash, savePen} from '../pen-save.js'
import type {OpenLineEvent} from './play-console.js'
import type {PlayEditor} from './play-editor.js'

import './play-editor.js'
import './play-pen-footer.js'
import './play-pen-header.js'
import './play-preview.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen': PlayPen
  }
}

/**
 * A complete and standalone playground: an editor, a runtime and client, a
 * preview and toolbar. Accepts a slotted template.
 */
@customElement('play-pen')
export class PlayPen extends LitElement {
  static override styles = css`
    :host {
      /* to-do: Support light and dark mode. */
      /* color-scheme: light dark; */

      /* Global z-index definitions. */
      --z-menu: 10;
      --z-base: 1;

      /* Global color definitions. */
      --color-orangered-100: #ffede5;
      --color-orangered-500: #d93a00;

      /* #theme# Light mode color definitions. */
      --color-background: #fffcf0;
      --color-neutral-content-weak: #576f76;
      --color-neutral-content: #2a3c42;
      --color-neutral-content-strong: #0f1a1c;
      --color-neutral-background: #ffffff;
      --color-neutral-background-hovered: #f9fafa;
      --color-neutral-border: rgba(0, 0, 0, 0.2);
      --color-brand-background: #d93a00;
      --color-brand-background-hovered: #962900;
      --color-brand-background-pressed: #7e2200;
      --color-brand-onBackground: #ffffff;
      --color-secondary-plain: #0f1a1c;
      --color-secondary-background: #eaedef;
      --color-secondary-background-hovered: #e2e7e9;
      --color-secondary-background-pressed: #bec2c4;
      --color-secondary-onBackground: #000000;
      --color-interactive-content-disabled: rgba(0, 0, 0, 0.25);
      --color-interactive-background-disabled: rgba(0, 0, 0, 0.05);

      /* #theme# Light mode. */
      color: #213547;
      background-color: var(--color-background);

      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        /* #theme# Dark mode. */
        /* color: rgba(255, 255, 255, 0.87);
        background-color: #242424; */
      }
    }

    play-editor {
      width: 100%;
      flex-grow: 1;
      flex-shrink: 1;
    }

    play-preview {
      flex-shrink: 0;
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
      'Hello Blocks!': helloBlocks,
      'Progress Bar': progressBar,
      Clock: clock,
      'Blocks Gallery': blocksGallery
    }

  /** Program executable. */
  @state() private _bundle?: Readonly<LinkedBundle> | undefined
  /** Execution preview widths. */
  @state() private _previewWidth: number = 288
  @state() private _diagnostics: Diagnostics = {previewErrs: [], tsErrs: []}
  @query('play-editor') private _editor!: PlayEditor
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
    if (this.allowURL) pen = loadPen(globalThis.location)
    if (this.allowStorage) pen ??= loadPen(globalThis.localStorage)
    if (!pen) {
      this.#template = true
      this.#setSrc(helloBlocks, false)
      return
    }
    this.#setSrc(pen.src, false)
    this.#setName(pen.name, false)
  }

  protected override render() {
    return html`<play-pen-header
        name=${this._name}
        .srcByLabel=${this.srcByLabel}
        @edit-name=${(ev: CustomEvent<string>) =>
          this.#setName(ev.detail, true)}
        @edit-src=${(ev: CustomEvent<string>) => {
          this.#setSrc(ev.detail, false)
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
            this.srcByLabel = {['Default']: ev.detail, ...this.srcByLabel}
            if (!this.#template) return
            // If no source was restored, use the template.
            this.#setSrc(ev.detail, false)
            this._editor.setSrc(ev.detail)
          }}
          ><slot></slot
        ></play-editor>
        <play-preview
          .bundle=${this._bundle}
          previewWidth=${this._previewWidth}
          scheme=${ifDefined(this._scheme)}
          @clear-errors=${() => this.#clearPreviewErrors()}
          @error=${(ev: CustomEvent<PreviewError>) =>
            this.#appendPreviewError(ev.detail)}
        ></play-preview>
      </main>
      <play-pen-footer
        previewWidth=${this._previewWidth}
        .diagnostics=${this._diagnostics}
        scheme=${ifDefined(this._scheme)}
        @preview-width=${(ev: CustomEvent<number>) =>
          (this._previewWidth = ev.detail)}
        @preview-scheme=${(ev: CustomEvent<ColorScheme | undefined>) =>
          (this._scheme = ev.detail)}
        @open-line=${(ev: OpenLineEvent) =>
          this._editor.openLine(ev.detail.line, ev.detail.char)}
      ></play-pen-footer>`
  }

  #appendPreviewError(err: PreviewError): void {
    this._diagnostics = {
      ...this._diagnostics,
      previewErrs: [...this._diagnostics.previewErrs, err]
    }
  }

  /** Save to LocalStorage as allowed. */
  #autoSave(): void {
    if (this.allowStorage)
      savePen(
        undefined,
        globalThis.localStorage,
        PenSave(this._name, this._src ?? '')
      )
  }

  #clearPreviewErrors(): void {
    if (this._diagnostics) this._diagnostics.previewErrs.length = 0
    this._diagnostics = {...this._diagnostics}
  }

  async #onShare(): Promise<void> {
    // to-do: record to clipboard and show a toast.
    this.#save()
    const url = new URL(globalThis.location.href)
    url.hash = penToHash(PenSave(this._name, this._src ?? ''))
    await navigator.clipboard.writeText(url.href)
  }

  /** Save to LocalStorage and URL as allowed. */
  #save(): void {
    savePen(
      this.allowURL ? globalThis.location : undefined,
      this.allowStorage ? globalThis.localStorage : undefined,
      PenSave(this._name, this._src ?? '')
    )
  }

  #setName(name: string, save: boolean): void {
    this._name = name
    if (save) this.#autoSave()
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
    // Skip blank source.
    if (!/^\s*$/.test(src)) this._bundle = link(compile(this.#env))
    if (save) this.#autoSave()
  }
}
