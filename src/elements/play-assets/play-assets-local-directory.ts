import {customElement} from 'lit/decorators.js'
import {PlayAssetManagerListener} from './play-asset-manager-listener.js'
import {css, html, type TemplateResult} from 'lit'
import {cssReset} from '../../utils/css-reset.js'
import {AssetManager} from '../../assets/asset-manager.js'
import {when} from 'lit-html/directives/when.js'
import {fileAccessContext} from '../../utils/file-access-api.js'

import '../play-button.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-local-directory': PlayAssetsLocalDirectory
  }
}

@customElement('play-assets-local-directory')
export class PlayAssetsLocalDirectory extends PlayAssetManagerListener {
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
  `

  protected override render(): TemplateResult {
    return html`
      <span>Local directory:</span>
      <div class="row vcenter">
        ${when(
          this.isDirectoryMounted,
          () =>
            html`<pre class="grow">.../${this.mountedDirectory}</pre>
              <play-button
                appearance="bordered"
                size="small"
                icon="share-ios-outline"
                icon-color="red"
                title="Unmount"
                @click=${() => AssetManager.unmount()}
              ></play-button>`,
          () =>
            html`<span class="no-selection grow">No directory selected</span
              ><play-button
                appearance="inverted"
                size="small"
                label="Select"
                @click=${this._pickDirectory}
              ></play-button>`
        )}
      </div>
    `
  }

  private _pickDirectory = async () => {
    const directoryHandle = await fileAccessContext.showDirectoryPicker({
      id: 'selectDirectory',
      mode: 'read'
    })
    if (directoryHandle) {
      await AssetManager.mountLocalDirectory(directoryHandle)
    }
  }
}
