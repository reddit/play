import {LitElement, html, nothing, type TemplateResult} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'

import addOutline from './icons/add-outline.svg'
import caretDownOutline from './icons/caret-down-outline.svg'
import caretUpOutline from './icons/caret-up-outline.svg'
import checkmarkFill from './icons/checkmark-fill.svg'
import closeOutline from './icons/close-outline.svg'
import communityOutline from './icons/community-outline.svg'
import copyClipboardOutline from './icons/copy-clipboard-outline.svg'
import dayOutline from './icons/day-outline.svg'
import downloadOutline from './icons/download-outline.svg'
import externalOutline from './icons/external-outline.svg'
import infoOutline from './icons/info-outline.svg'
import nightOutline from './icons/night-outline.svg'
import overflowHorizontalOutline from './icons/overflow-horizontal-outline.svg'
import readingOutline from './icons/reading-outline.svg'
import reportOutline from './icons/report-outline.svg'
import resizeHorizontalOutline from './icons/resize-horizontal-outline.svg'
import restartOutline from './icons/restart-outline.svg'
import shareNewOutline from './icons/share-new-outline.svg'

export type PlayIconSVG = keyof typeof icons

const icons = {
  'add-outline': addOutline,
  'caret-down-outline': caretDownOutline,
  'caret-up-outline': caretUpOutline,
  'checkmark-fill': checkmarkFill,
  'close-outline': closeOutline,
  'community-outline': communityOutline,
  'copy-clipboard-outline': copyClipboardOutline,
  'day-outline': dayOutline,
  'download-outline': downloadOutline,
  'external-outline': externalOutline,
  'info-outline': infoOutline,
  'night-outline': nightOutline,
  'overflow-horizontal-outline': overflowHorizontalOutline,
  'reading-outline': readingOutline,
  'report-outline': reportOutline,
  'resize-horizontal-outline': resizeHorizontalOutline,
  'restart-outline': restartOutline,
  'share-new-outline': shareNewOutline
}

declare global {
  interface HTMLElementTagNameMap {
    'play-icon': PlayIcon
  }
}

@customElement('play-icon')
export class PlayIcon extends LitElement {
  @property({type: String}) size = '16px'
  @property({type: String}) color = 'currentColor'
  @property({type: String}) icon?: PlayIconSVG

  protected override render(): TemplateResult | typeof nothing {
    const style = {
      width: this.size,
      height: this.size,
      fill: this.color
    }
    return this.icon
      ? html`
          <div style=${styleMap(style)}>${unsafeHTML(icons[this.icon])}</div>
        `
      : nothing
  }
}
