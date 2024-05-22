import {customElement} from 'lit/decorators.js'
import {css, html, LitElement, type TemplateResult} from 'lit'
import {cssReset} from '../../utils/css-reset.js'
import {when} from 'lit-html/directives/when.js'
import {fileAccessContext} from '../../utils/file-access-api.js'
import {assetsContext, type PlayAssets} from './play-assets.js'
import {consume} from '@lit/context'

import '../play-button.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-assets-local-directory': PlayAssetsLocalDirectory
  }
}

@customElement('play-assets-local-directory')
export class PlayAssetsLocalDirectory extends LitElement {
  static override readonly styles = css`
    ${cssReset}

    .row {
      display: flex;
      flex-direction: row;
    }

    .row.vcenter {
      align-items: center;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .row .grow,
    .column .grow {
      flex-grow: 1;
    }

    .no-selection {
      font-size: 0.9em;
      color: darkgrey;
      font-style: italic;
    }

    pre {
      margin: 0;
    }
  `

  @consume({context: assetsContext})
  private _assets!: PlayAssets

  override connectedCallback(): void {
    super.connectedCallback()

    this._assets.addEventListener('assets-updated', this.#assetsUpdated)
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback()

    this._assets.removeEventListener('assets-updated', this.#assetsUpdated)
  }

  protected override render(): TemplateResult {
    return html`
      <span>Local directory:</span>
      <div class="row vcenter">
        ${when(
          this._assets.isDirectoryMounted,
          () =>
            html`<pre class="grow">.../${this._assets.directoryName}</pre>
              <play-button
                appearance="bordered"
                size="small"
                icon="share-ios-outline"
                icon-color="red"
                title="Unmount"
                @click=${() => this._assets.unmount()}
              ></play-button>`,
          () =>
            html`<span class="no-selection grow">No directory selected</span
              ><play-button
                appearance="inverted"
                size="small"
                label="Select"
                @click=${this.#pickDirectory}
              ></play-button>`
        )}
      </div>
    `
  }

  #pickDirectory = async (): Promise<void> => {
    const directoryHandle = await fileAccessContext.showDirectoryPicker({
      id: 'selectDirectory',
      mode: 'read'
    })
    if (directoryHandle) {
      await this._assets.mountLocalDirectory(directoryHandle)
    }
  }

  #assetsUpdated = (): void => {
    this.requestUpdate()
  }
}
