import type {LinkedBundle} from '@devvit/protos'
import {provide} from '@lit-labs/context'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import {LitElement, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {
  appEntrypointFilename,
  compile,
  newTSEnv,
  setSource
} from '../../bundler/compiler.js'
import {link} from '../../bundler/linker.js'
import type {ColorScheme} from '../../types/color-scheme.js'
import {PenSave, loadPen, savePen} from '../pen-save.js'
import {penCtx} from './play-pen-context.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-pen-context-provider': PlayPenContextProvider
  }
}

/** play-pen context provider. */
@customElement('play-pen-context-provider')
export class PlayPenContextProvider extends LitElement {
  @provide({context: penCtx.allowStorage})
  @property({attribute: 'allow-storage', type: Boolean})
  allowStorage: boolean = false
  @provide({context: penCtx.allowURL})
  @property({attribute: 'allow-url', type: Boolean})
  allowURL: boolean = false
  @provide({context: penCtx.bundle}) @property({type: Object}) bundle?:
    | LinkedBundle
    | undefined
  @provide({context: penCtx.env})
  @property({attribute: false})
  readonly env: VirtualTypeScriptEnvironment = newTSEnv()
  @provide({context: penCtx.name}) @property() name: string = ''
  @provide({context: penCtx.scheme}) @property() scheme: ColorScheme | undefined
  @provide({context: penCtx.src}) @property() src: string | undefined
  @provide({context: penCtx.template}) @property() template: string | undefined

  override connectedCallback(): void {
    super.connectedCallback()

    let pen
    if (this.allowStorage) pen = loadPen(globalThis.localStorage)
    if (this.allowURL) {
      const urlPen = loadPen(globalThis.location)
      if (urlPen) {
        this.setTemplate(urlPen.src)
        pen ??= urlPen
      }
    }
    if (!pen) return
    this.setSrc(pen.src)
    this.setName(pen.name)
  }

  protected override render() {
    return html`<slot
      @play-pen-set-name=${(ev: CustomEvent<string>) => this.setName(ev.detail)}
      @play-pen-set-scheme=${(ev: CustomEvent<ColorScheme | undefined>) =>
        this.setScheme(ev.detail)}
      @play-pen-set-src=${(ev: CustomEvent<string>) => this.setSrc(ev.detail)}
      @play-pen-set-template=${(ev: CustomEvent<string>) =>
        this.setTemplate(ev.detail)}
    />`
  }

  /** Save to LocalStorage as allowed. */
  autoSave(): void {
    if (this.allowStorage)
      savePen(
        undefined,
        globalThis.localStorage,
        PenSave(this.name, this.src ?? '')
      )
  }

  /** Save to LocalStorage and URL as allowed. */
  save(): void {
    savePen(
      this.allowURL ? globalThis.location : undefined,
      this.allowStorage ? globalThis.localStorage : undefined,
      PenSave(this.name, this.src ?? '')
    )
  }

  setName(name: string): void {
    this.name = name
    this.autoSave()
  }

  setScheme(scheme: ColorScheme | undefined): void {
    this.scheme = scheme
  }

  setSrc(src: string): void {
    this.src = src
    setSource(this.env, src)
    this.env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
    // Skip blank source.
    if (!/^\s*$/.test(src)) this.bundle = link(compile(this.env))
    this.autoSave()
  }

  setTemplate(template: string): void {
    this.template = template
  }
}
