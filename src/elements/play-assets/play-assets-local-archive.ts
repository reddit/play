import {customElement} from 'lit/decorators.js'
import {css, html, type TemplateResult} from 'lit'
import {when} from 'lit-html/directives/when.js'
import {AssetManager} from '../../assets/asset-manager.js'
import {PlayAssetManagerListener} from './play-asset-manager-listener.js'
import {cssReset} from '../../utils/css-reset.js'
import {type FilePickerType} from '../../utils/file-access-api.js'
import type {FilesSelectedEvent} from './file-upload-dropper.js'

import '../play-button.js'
import '../play-icon/play-icon.js'
import './file-upload-dropper.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-assets-local-archive': PlayAssetsLocalArchive
  }
}

@customElement('play-assets-local-archive')
export class PlayAssetsLocalArchive extends PlayAssetManagerListener {
  static override readonly styles = css`
    ${cssReset}

    .row {
      display: flex;
      flex-direction: row;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .row .grow {
      flex-grow: 1;
    }

    .row.gap {
      gap: 8px;
    }
  `

  protected override render(): TemplateResult {
    return this.isArchiveMounted
      ? this._renderArchiveDetails()
      : this._renderMountArchive()
  }

  private _renderMountArchive = () => {
    const types: FilePickerType[] = [
      {
        description: 'ZIP Archive',
        accept: {
          'application/*zip': ['.zip']
        }
      }
    ]

    return html`
      <span>ZIP archive:</span>
      <file-upload-dropper
        id="archive-picker"
        .acceptTypes="${types}"
        @files-selected=${this._onFiles}
      >
        <play-icon size="32px" icon="archived-outline"></play-icon>
        <span>Click to select a ZIP archive</span>
        <span>or</span>
        <span>Drop a ZIP file here</span>
      </file-upload-dropper>
    `
  }

  private _renderArchiveDetails = () => {
    return html`
      <div class="row gap">
        <div class="column grow">
          <span>Mounted archive:</span>
          <pre>${this.mountedArchive}</pre>
          <span>File count: ${this.assetCount}</span>
        </div>
        ${when(
          this.archiveCanRemount,
          () =>
            html`<play-button
              appearance="bordered"
              size="small"
              icon="restart-outline"
              title="Refresh"
              @click=${() => AssetManager.remountLocalArchive()}
            ></play-button>`
        )}
        <play-button
          appearance="bordered"
          size="small"
          icon="share-ios-outline"
          icon-color="red"
          title="Unmount"
          @click=${() => AssetManager.unmount()}
        ></play-button>
      </div>
    `
  }

  private _onFiles = async (ev: CustomEvent<FilesSelectedEvent>) => {
    const file = ev.detail.fileHandles?.[0] ?? ev.detail.files?.[0]
    if (file) {
      await AssetManager.mountLocalArchive(file)
    }
  }
}
