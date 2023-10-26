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
    .close {
      float: right;
    }
    dialog {
      background-color: var(--color-interactive-background);
      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);
      border-width: var(--border-width);
      border-color: var(--color-neutral-border);

      /* Add gap between viewport. */
      margin-top: var(--space);

      /* h2 has enough spacing. */
      padding-top: 0;

      /* to-do: breakpoints */
      width: 480px;
    }
    h2 {
      /* No spacing needed from horizontal rule. */
      margin-bottom: 0;
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
      max-height: 160px;
      background-color: var(--color-background);
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
      <h2>
        Export<play-button
          appearance="plain"
          class="close"
          @click=${this.close}
          size="small"
          title="Close"
          >🞪</play-button
        >
      </h2>
      <hr />
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
            @click=${async () => {
              await navigator.clipboard.writeText(cmd)
              this._toast.open()
            }}
            >Copy to Clipboard</play-button
          >
        </li>
        <li>Paste the command into a terminal and press enter.</li>
      </ol>
      <play-toast>Command copied to clipboard.</play-toast>
    </dialog>`
  }
}
