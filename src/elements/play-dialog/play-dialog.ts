import {customElement, property, query} from 'lit/decorators.js'
import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {cssReset} from '../../utils/css-reset.js'

import '../play-button.js'
import {when} from 'lit-html/directives/when.js'

declare global {
  interface HTMLElementEventMap {}
  interface HTMLElementTagNameMap {
    'play-dialog': PlayDialog
  }
}

export interface PlayDialogLike {
  open(): void
  close(): void
}

@customElement('play-dialog')
export class PlayDialog extends LitElement implements PlayDialogLike {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

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
  `

  @property({attribute: 'dialog-title', type: String, reflect: true})
  dialogTitle: string = ''

  @property({attribute: 'description', type: String, reflect: true})
  description: string = ''

  @query('dialog')
  private _dialog!: HTMLDialogElement

  open(): void {
    this._dialog.showModal()
  }

  close(): void {
    this._dialog.close()
    this.dispatchEvent(
      new CustomEvent('closed', {bubbles: true, composed: true})
    )
  }

  protected override render(): TemplateResult {
    return html`
      <dialog>
        <header>
          <h1>${this.dialogTitle}</h1>
          <play-button
            appearance="plain"
            icon="close-outline"
            @click=${this.close}
            size="small"
            title="Close"
          ></play-button>
        </header>

        ${when(this.description, () => html`<p>${this.description}</p>`)}

        <slot></slot>
      </dialog>
    `
  }
}
