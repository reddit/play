import {LitElement, html, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {styleMap} from 'lit/directives/style-map.js'
import {unsafeHTML} from 'lit/directives/unsafe-html.js'
import addOutline from '../assets/icons/add-outline.svg'
import caretDownOutline from '../assets/icons/caret-down-outline.svg'
import caretUpOutline from '../assets/icons/caret-up-outline.svg'
import communityOutline from '../assets/icons/community-outline.svg'
import dayOutline from '../assets/icons/day-outline.svg'
import externalOutline from '../assets/icons/external-outline.svg'
import infoOutline from '../assets/icons/info-outline.svg'
import nightOutline from '../assets/icons/night-outline.svg'
import overflowHorizontalOutline from '../assets/icons/overflow-horizontal-outline.svg'
import reportOutline from '../assets/icons/report-outline.svg'
import resizeHorizontalOutline from '../assets/icons/resize-horizontal-outline.svg'
import shareNewOutline from '../assets/icons/share-new-outline.svg'
import restartOutline from '../assets/icons/restart-outline.svg'

export type PlayIconSVG = keyof typeof icons

const icons = {
  'add-outline': addOutline,
  'caret-down-outline': caretDownOutline,
  'caret-up-outline': caretUpOutline,
  'community-outline': communityOutline,
  'day-outline': dayOutline,
  'external-outline': externalOutline,
  'info-outline': infoOutline,
  'night-outline': nightOutline,
  'overflow-horizontal-outline': overflowHorizontalOutline,
  'report-outline': reportOutline,
  'resize-horizontal-outline': resizeHorizontalOutline,
  'share-new-outline': shareNewOutline,
  'restart-outline': restartOutline
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

  protected override render() {
    const style = {
      width: this.size,
      height: this.size,
      fill: this.color
    }
    return this.icon
      ? html`<div style=${styleMap(style)}>
          ${unsafeHTML(icons[this.icon])}
        </div>`
      : nothing
  }
}
