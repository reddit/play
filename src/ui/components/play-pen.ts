import type {LinkedBundle} from '@devvit/protos'
import * as tsvfs from '@typescript/vfs'
import {LitElement, css, html} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {
  appEntrypointFilename,
  compile,
  newTSEnv
} from '../../bundler/compiler.js'
import {link} from '../../bundler/linker.js'

import './play-pen-header.js'
import './play-editor.js'
import './play-preview.js'
import './play-pen-footer.js'

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

  @state() private _bundle?: LinkedBundle | undefined
  readonly #env: tsvfs.VirtualTypeScriptEnvironment = newTSEnv()

  protected override render() {
    return html`
      <div>
        <play-pen-header></play-pen-header>
        <main>
          <play-editor
            @edit=${(ev: CustomEvent<string>) => this.#build(ev.detail)}
            .env=${this.#env}
            ><slot
          /></play-editor>
          <play-preview .bundle=${this._bundle}></play-preview>
        </main>
        <play-pen-footer></play-pen-footer>
      </div>
    `
  }

  #build(src: string): void {
    this.#env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
    if (/^\s*$/.test(src)) return // Skip blank source.
    this._bundle = link(compile(this.#env))
  }
}
