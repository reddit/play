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

import './play-editor.js'
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
      display: flex;
      flex-direction: column;

      /* Fill available space. */
      height: 100%;
    }

    play-editor {
      /* Occupy available space. */
      flex-shrink: 1;

      /** The editor can be shrunk. */
      flex-grow: 1;
      min-height: 0;
    }
  `

  @state() private _bundle?: LinkedBundle | undefined
  readonly #env: tsvfs.VirtualTypeScriptEnvironment = newTSEnv()

  protected override render() {
    return html`
      <div>
        <play-editor
          @edit=${(ev: CustomEvent<string>) => this.#build(ev.detail)}
          .env=${this.#env}
          ><slot
        /></play-editor>
        <play-preview .bundle=${this._bundle}></play-preview>
      </div>
    `
  }

  #build(src: string): void {
    this.#env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
    if (/^\s*$/.test(src)) return // Skip blank source.
    this._bundle = link(compile(this.#env))
  }
}
