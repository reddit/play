import {LitElement, css, html} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import type {PlayPenContextProvider} from './play-pen-context-provider.js'
import type {PlayEditor} from './play-editor.js'

import './play-editor.js'
import './play-pen-context-provider.js'
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
    play-pen-context-provider {
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
  @property({attribute: 'allow-storage', type: Boolean}) allowStorage: boolean =
    false
  /**
   * Allow loading and saving from URL hash. Loading from hash has precedence
   * over LocalStorage. Do not enable for multiple playgrounds on the same
   * document.
   */
  @property({attribute: 'allow-url', type: Boolean}) allowURL: boolean = false

  @query('play-pen-context-provider') private _provider!: PlayPenContextProvider
  @query('play-editor') private _editor!: PlayEditor

  protected override render() {
    return html`
      <play-pen-context-provider
        ?allow-storage=${this.allowStorage}
        ?allow-url=${this.allowURL}
      >
        <play-pen-header
          @new=${this.#onReset}
          @share=${this.#onShare}
        ></play-pen-header>
        <main>
          <play-editor><slot /></play-editor>
          <play-preview
            @execution-error=${(ev: CustomEvent<unknown>) =>
              this.#reportError(ev.detail)}
          ></play-preview>
        </main>
        <play-pen-footer></play-pen-footer>
      </play-pen-context-provider>
    `
  }

  #onReset(): void {
    this._provider.setName('')
    this._provider.setSrc(this._provider.template ?? '')
    this._editor.setSrc(this._provider.template ?? '')
  }

  #onShare(): void {
    // to-do: record to clipboard and show a toast.
    this._provider.save()
  }

  #reportError(err: unknown): void {
    // to-do: report errors to users.
    console.error(err)
  }
}
