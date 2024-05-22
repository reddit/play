import {customElement, property} from 'lit/decorators.js'
import {css, html, LitElement, type TemplateResult} from 'lit'
import {cssReset} from '../../utils/css-reset.js'
import {when} from 'lit-html/directives/when.js'
import {fileAccessContext} from '../../utils/file-access-api.js'

import '../play-button.js'
import {
  type AssetsFilesystemChange,
  type AssetsState,
  emptyAssetsState
} from './play-assets.js'
import {Bubble} from '../../utils/bubble.js'

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

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  protected override render(): TemplateResult {
    return html`
      <span>Local directory:</span>
      <div class="row vcenter">
        ${when(
          this.assetsState.directoryName,
          () =>
            html`<pre class="grow">.../${this.assetsState.directoryName}</pre>
              <play-button
                appearance="bordered"
                size="small"
                icon="share-ios-outline"
                icon-color="red"
                title="Unmount"
                @click=${() => this.#emitChange({kind: 'unmount'})}
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
      this.#emitChange({kind: 'mount-directory', directoryHandle})
    }
  }

  #emitChange(change: AssetsFilesystemChange): void {
    this.dispatchEvent(
      Bubble<AssetsFilesystemChange>('assets-filesystem-change', change)
    )
  }
}
