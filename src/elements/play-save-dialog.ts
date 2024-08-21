import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import {PlayDialog} from './play-dialog/play-dialog.js'
import {cssReset} from '../utils/css-reset.js'

import './play-button.js'
import './play-dialog/play-dialog.js'
import './play-toast.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-save-dialog': PlaySaveDialog
  }
}

@customElement('play-save-dialog')
export class PlaySaveDialog extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    legend {
      font-weight: bold;
    }

    ol {
      margin-bottom: 0;
      padding-left: 0;

      /* Moves the numbers inside the element */
      list-style-position: inside;
    }

    li {
      margin-top: var(--space);
    }

    pre {
      overflow-y: auto;
      margin-top: var(--space);
      margin-bottom: var(--space);
      word-break: break-all;
      white-space: pre-line;
      max-height: 100px;
      font-family: var(--font-family-mono);
      font-size: 14px;
      line-height: 1.5;
      background-color: var(--color-secondary-background);
      color: inherit;

      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);

      padding-left: var(--space);
      padding-top: var(--space);
      padding-right: var(--space);
      padding-bottom: var(--space);

      margin-top: var(--space);
      margin-bottom: var(--space);
    }

    p,
    li {
      color: inherit;
      /* RPL/Body Regular/14-BodyReg */
      font-family: var(--font-family-sans);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }

    a,
    a:visited {
      color: var(--color-link);
    }

    a:hover {
      color: var(--color-link-hovered);
    }
  `

  @property() src: string = ''

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  open(): void {
    this._dialog.open()
  }

  close(): void {
    this._dialog.close()
  }

  _save(): void {
    console.log('saved clicked')
  }

  protected override render(): TemplateResult {
    return html` <play-dialog
        dialog-title="Save project"
        description="Start a project from this pen:"
      >
        <input type="text" id="project-title" value="" placeholder="Project Title" />
        <input type="button" value="Save" @click=${() => this._save()} />
      </play-dialog>
      `
  }
}
