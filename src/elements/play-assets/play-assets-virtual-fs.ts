import {customElement, property, query, state} from 'lit/decorators.js'
import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult
} from 'lit'
import {cssReset} from '../../utils/css-reset.js'
import type {FileSelection} from './file-upload-dropper.js'
import {when} from 'lit-html/directives/when.js'
import {repeat} from 'lit/directives/repeat.js'
import {createRef, type Ref, ref} from 'lit/directives/ref.js'
import {
  type AssetsState,
  type AssetsVirtualFileChange,
  emptyAssetsState
} from './play-assets.js'
import {Bubble} from '../../utils/bubble.js'

import '../play-button.js'
import '../play-icon/play-icon.js'
import './file-upload-dropper.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-assets-virtual-fs': PlayAssetsVirtualFilesystem
  }
}

@customElement('play-assets-virtual-fs')
export class PlayAssetsVirtualFilesystem extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    :host {
      display: flex;
      flex-direction: column;
    }

    #fileList {
      height: 200px;
      margin-top: 8px;
      gap: 8px;
      overflow-y: auto;
    }

    #empty {
      font-style: italic;
      font-size: 0.9em;
      color: gray;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
    }

    #removeAll {
      margin-top: 8px;
      width: 100%;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    legend {
      font-weight: bold;
    }

    .asset {
      align-items: center;
      gap: 8px;
    }

    .row {
      display: flex;
      flex-direction: row;
    }

    .column {
      display: flex;
      flex-direction: column;
    }

    .grow {
      flex-grow: 1;
    }

    .code {
      font-family: monospace;
    }
  `

  @property({attribute: false})
  assetsState: AssetsState = emptyAssetsState()

  @state()
  private _assetNames: string[] = []

  @state()
  private _renameIndex: number = -1

  @state()
  private _deleteIndex: number = -1

  @state()
  private _clearAll: boolean = false

  @query('#renameAsset', false)
  private _renameInput: HTMLInputElement | undefined

  #renameInputRef: Ref<HTMLInputElement> = createRef()

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('assetsState')) {
      this._assetNames = Object.keys(this.assetsState.map)
      this._renameIndex = -1
      this._deleteIndex = -1
      this._clearAll = false
    }
  }

  protected override update(
    changedProperties: PropertyValues<{_renameIndex: number}>
  ) {
    super.update(changedProperties)
    if (changedProperties.has('_renameIndex')) {
      if (this._renameIndex >= 0) {
        this.#renameInputRef.value?.focus()
      }
    }
  }

  protected override render(): TemplateResult {
    return html`
      <file-upload-dropper
        id="virtualFileUpload"
        multiple
        @files-selected=${this.#onFiles}
      >
        <play-icon size="32px" icon="assets-outline"></play-icon>
        <span>Click to select files</span>
        <span>or</span>
        <span>Drop files here</span>
      </file-upload-dropper>
      ${this.#renderFileList()}
      <div id="removeAll" class="row">
        ${when(
          this._clearAll,
          this.#renderClearAllPrompt,
          this.#renderClearAllButton
        )}
      </div>
    `
  }

  #renderFileList(): TemplateResult {
    return html`
      <fieldset id="fileList" class="column">
        ${when(
          this.assetsState.count > 0,
          this.#renderFiles,
          this.#renderNoFiles
        )}
      </fieldset>
    `
  }

  #renderFiles = (): TemplateResult => {
    return html` ${repeat(this._assetNames, this.#renderAssetEntry)} `
  }

  #renderNoFiles = (): TemplateResult => {
    return html`<div id="empty" class="row">No assets added!</div>`
  }

  #renderAssetEntry = (name: string, index: number): TemplateResult => {
    if (index === this._renameIndex) {
      return this.#renderRenameAssetEntry(name)
    } else if (index === this._deleteIndex) {
      return this.#renderDeleteAssetEntry(name)
    }
    return html`
      <div class="asset row">
        <span class="grow code">${name}</span>
        <play-button
          size="small"
          appearance="bordered"
          title="Rename"
          icon="rename-outline"
          @click=${() => (this._renameIndex = index)}
        ></play-button>
        <play-button
          size="small"
          appearance="bordered"
          title="Remove"
          icon="delete-outline"
          icon-color="red"
          @click=${() => (this._deleteIndex = index)}
        ></play-button>
      </div>
    `
  }

  #renderRenameAssetEntry = (name: string): TemplateResult => {
    return html`
      <div class="asset row">
        <input
          type="text"
          value="${name}"
          id="renameAsset"
          class="grow code"
          @keyup=${this.#renameKeyUp}
          @keydown=${this.#renameKeyDown}
          ${ref(this.#renameInputRef)}
        />
        <play-button
          title="Save"
          icon="checkmark-fill"
          icon-color="green"
          size="small"
          appearance="bordered"
          @click=${this.#rename}
        ></play-button>
        <play-button
          title="Cancel"
          icon="close-outline"
          icon-color="red"
          size="small"
          appearance="bordered"
          @click=${() => (this._renameIndex = -1)}
        ></play-button>
      </div>
    `
  }

  #renderDeleteAssetEntry = (name: string): TemplateResult => {
    return html`
      <div class="asset row">
        <span class="grow">Remove <span class="bold code">${name}</span>?</span>
        <play-button
          title="Confirm"
          icon="delete-outline"
          icon-color="red"
          size="small"
          appearance="bordered"
          @click=${this.#delete(name)}
        ></play-button>
        <play-button
          title="Cancel"
          icon="close-outline"
          size="small"
          appearance="bordered"
          @click=${() => (this._deleteIndex = -1)}
        ></play-button>
      </div>
    `
  }

  #renderClearAllButton = (): TemplateResult =>
    html`<play-button
      label="Remove All"
      appearance="bordered"
      size="small"
      ?disabled=${this.assetsState.count === 0}
      @click=${() => (this._clearAll = true)}
    ></play-button>`

  #renderClearAllPrompt = (): TemplateResult => html`
    <span class="grow">Remove all assets?</span>
    <play-button
      title="Confirm"
      icon="delete-outline"
      icon-color="red"
      size="small"
      appearance="bordered"
      @click=${this.#clearAllAssets}
    ></play-button>
    <play-button
      title="Cancel"
      icon="close-outline"
      size="small"
      appearance="bordered"
      @click=${() => (this._clearAll = false)}
    ></play-button>
  `

  #rename = (): void => {
    const oldName = this._assetNames[this._renameIndex]
    const newName = this._renameInput?.value?.trim()
    if (oldName && newName) {
      this.#emitChange({
        kind: 'rename',
        oldName,
        newName
      })
    }
  }

  #delete = (name: string) => (): void => {
    this.#emitChange({
      kind: 'remove',
      name
    })
  }

  #clearAllAssets = (): void => {
    this.#emitChange({kind: 'clear'})
  }

  #onFiles = (ev: CustomEvent<FileSelection>): void => {
    const files = ev.detail.files ?? ev.detail.fileHandles
    if (files) {
      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        if (file) {
          this.#emitChange({
            kind: 'add',
            fileHandle: file
          })
        }
      }
    }
  }

  #renameKeyDown = (ev: KeyboardEvent): void => {
    if (ev.key === '/' || ev.key === '\\') {
      ev.preventDefault()
      ev.stopImmediatePropagation()
    }
  }

  #renameKeyUp = (ev: KeyboardEvent): void => {
    if (ev.key === 'Enter') {
      this.#rename()
    }
  }

  #emitChange(change: AssetsVirtualFileChange): void {
    this.dispatchEvent(
      Bubble<AssetsVirtualFileChange>('assets-virtual-file-change', change)
    )
  }
}
