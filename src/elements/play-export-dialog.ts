import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import type {PlayToast} from './play-toast.js'
import {PlayDialog} from './play-dialog/play-dialog.js'
import {cssReset} from '../utils/css-reset.js'

import './play-button.js'
import './play-dialog/play-dialog.js'
import './play-toast.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-export-dialog': PlayExportDialog
  }
}

@customElement('play-export-dialog')
export class PlayExportDialog extends LitElement {
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

  @property() url: string = ''

  @query('play-toast') _toast!: PlayToast

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  open(): void {
    this._dialog.open()
  }

  close(): void {
    this._dialog.close()
  }

  protected override render(): TemplateResult {
    const cmd = `npx devvit@latest new --template='${this.url}'`
    return html` <play-dialog
        dialog-title="Export project"
        description="Start a new project from this pen:"
      >
        <ol>
          <li>
            <a
              href="https://developers.reddit.com/docs/quickstart"
              target="_blank"
              >Install Node.js and the Devvit command-line tool.</a
            >
          </li>
          <li>
            Copy the new project command:
            <pre>${cmd}</pre>
            <play-button
              appearance="bordered"
              size="small"
              icon="copy-clipboard-outline"
              label="Copy to clipboard"
              @click=${async () => {
                await navigator.clipboard.writeText(cmd)
                this._toast.open()
              }}
            ></play-button>
          </li>
          <li>Paste the command into a terminal and press enter.</li>
        </ol>
      </play-dialog>
      <play-toast>Copied the command!</play-toast>`
  }
}
