import type {LinkedBundle} from '@devvit/protos'
import * as tsvfs from '@typescript/vfs'
import {LitElement, css, html} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {
  appEntrypointFilename,
  compile,
  getSource,
  newTSEnv,
  setSource
} from '../../bundler/compiler.js'
import {link} from '../../bundler/linker.js'
import {PenSave, loadPen, savePen} from '../pen-save.js'

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
 * preview and toolbar.
 */
@customElement('play-pen')
export class PlayPen extends LitElement {
  static override styles = css`
    div {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 0 24px var(--rpl-brand-background);
      background-color: var(--rpl-neutral-background);
    }

    play-editor {
      width: 100%;
    }

    play-preview {
      width: 343px;
      flex-shrink: 0;
    }

    main {
      display: flex;
      flex-direction: row;
      gap: 24px;
      padding-top: 0;
      padding-right: 24px;
      padding-bottom: 24px;
      padding-left: 24px;
      height: 100%;
      background-color: var(--rpl-neutral-background);
    }
  `

  /**
   * Allow loading and saving from LocalStorage. Do not enable for multiple
   * playgrounds on the same document.
   */
  @property({type: Boolean}) save: boolean = false
  /**
   * Allow loading and saving from URL hash. Loading from hash has precedence
   * over LocalStorage. Do not enable for multiple playgrounds on the same
   * document.
   */
  @property({type: Boolean}) url: boolean = false

  @state() private _bundle?: LinkedBundle | undefined
  readonly #env: tsvfs.VirtualTypeScriptEnvironment = newTSEnv()
  /** Initial program source on load. This value is never updated. */
  #initSrc?: string | undefined
  /** Program name. */
  @state() private _name: string = ''
  @state() private _scheme: 'dark' | 'light' | undefined

  override connectedCallback(): void {
    super.connectedCallback()
    const pen = loadPen(
      this.url ? globalThis.location : undefined,
      this.save ? globalThis.localStorage : undefined
    )
    this.#initSrc = pen?.src
    this._name = pen?.name ?? ''
    if (this.#initSrc != null) this.#editSrc(this.#initSrc)
  }

  protected override render() {
    return html`
      <div>
        <play-pen-header
          .name=${this._name}
          @edit-name=${(ev: CustomEvent<string>) => this.#editName(ev.detail)}
          @new=${this.#reset}
          @share=${this.#onShare}
        ></play-pen-header>
        <main>
          <play-editor
            .env=${this.#env}
            .src=${this.#initSrc}
            @edit=${(ev: CustomEvent<string>) => this.#editSrc(ev.detail)}
            ><slot
          /></play-editor>
          <play-preview
            .bundle=${this._bundle}
            .scheme=${this._scheme}
            @execution-error=${(ev: CustomEvent<unknown>) =>
              this.#reportError(ev.detail)}
          ></play-preview>
        </main>
        <play-pen-footer
          @toggle-scheme=${() => {
            this._scheme = this.#isDark() ? 'light' : 'dark'
          }}
        ></play-pen-footer>
      </div>
    `
  }

  #editName(name: string): void {
    this._name = name
    // Don't update URL on auto-save.
    if (this.save)
      savePen(
        undefined,
        globalThis.localStorage,
        PenSave(this._name, getSource(this.#env))
      )
  }

  #editSrc(src: string): void {
    setSource(this.#env, src)
    this.#env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
    // Skip blank source.
    if (!/^\s*$/.test(src)) this._bundle = link(compile(this.#env))
    // Don't update URL on auto-save.
    if (this.save)
      savePen(undefined, globalThis.localStorage, PenSave(this._name, src))
  }

  #reset(): void {
    // to-do: reset to template / starting URL in an undo-able way or show a
    // prompt.
  }

  #onShare(): void {
    // to-do: record to clipboard and show a toast.
    savePen(
      this.url ? globalThis.location : undefined,
      this.save ? globalThis.localStorage : undefined,
      PenSave(this._name, getSource(this.#env))
    )
  }

  #isDark(): boolean {
    return (
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches ||
      this._scheme === 'dark'
    )
  }

  #reportError(err: unknown): void {
    // to-do: report errors to users.
    console.error(err)
  }
}
