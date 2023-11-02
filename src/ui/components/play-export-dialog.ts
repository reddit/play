import {LitElement, css, html} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'
import type {PlayToast} from './play-toast.js'

import './play-button.js'
import './play-toast.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-export-dialog': PlayExportDialog
  }
}

@customElement('play-export-dialog')
export class PlayExportDialog extends LitElement {
  static override styles = css`
    dialog {
      color: var(--color-neutral-content);
      background-color: var(--color-neutral-background);
      box-shadow: var(--shadow-m);

      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);

      padding-top: var(--space);
      padding-bottom: var(--space);
      padding-left: var(--space);
      padding-right: var(--space);

      /* No border needed. Dialog background has sufficient contrast against the scrim. */
      border-width: 0;

      /* to-do: breakpoints */
      width: 480px;
      max-width: 90vw;
    }

    dialog::backdrop {
      /* to-do: Update to css variable --color-shade-60 once supported by Chromium and Safari.
      https://bugs.webkit.org/show_bug.cgi?id=263834
      https://bugs.chromium.org/p/chromium/issues/detail?id=827397
      https://stackoverflow.com/a/77393321 */
      background-color: rgba(0, 0, 0, 0.6);
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      row-gap: var(--space);
    }

    h1 {
      color: var(--color-neutral-content-strong);

      /* No margins needed for composition. */
      margin-top: 0;
      margin-bottom: 0;

      /* RPL/Heading Bold/24-HeadingBold */
      font-family: var(--font-family-sans);
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 28px;
      letter-spacing: 0.2px;
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
  @query('dialog') private _dialog!: HTMLDialogElement

  open(): void {
    this._dialog.showModal()
  }

  close(): void {
    this._dialog.close()
  }

  protected override render() {
    const cmd = `npx devvit new --template='${this.url}'`
    return html`<dialog>
      <header>
        <h1>Export project</h1>
        <play-button
          appearance="plain"
          icon="close-outline"
          @click=${this.close}
          size="small"
          title="Close"
        ></play-button>
      </header>

      <p>Start a new project from this pen:</p>
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
      <play-toast>Command copied to clipboard.</play-toast>
    </dialog>`
  }
}
