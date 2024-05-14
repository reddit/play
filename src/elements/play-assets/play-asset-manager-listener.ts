import {LitElement} from 'lit'
import {AssetManager} from '../../assets/asset-manager.js'
import {state} from 'lit/decorators.js'

export abstract class PlayAssetManagerListener extends LitElement {
  @state()
  protected isDirectoryMounted: boolean = false

  @state()
  protected isArchiveMounted: boolean = false

  @state()
  protected archiveCanRemount: boolean = false

  @state()
  protected mountedDirectory: string = ''

  @state()
  protected mountedArchive: string = ''

  @state()
  protected assetCount: number = 0

  override connectedCallback() {
    super.connectedCallback()

    AssetManager.addEventListener('change', this._updateState)
    this._updateState()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()

    AssetManager.removeEventListener('change', this._updateState)
  }

  protected assetsUpdated(): void {}

  private _updateState = () => {
    this.isDirectoryMounted = AssetManager.isDirectoryMounted
    this.isArchiveMounted = AssetManager.isArchiveMounted
    this.archiveCanRemount = AssetManager.hasFileAccessAPI
    this.mountedArchive = AssetManager.archiveFilename
    this.mountedDirectory = AssetManager.directoryName
    this.assetCount = AssetManager.fileCount
    this.assetsUpdated()
  }
}
