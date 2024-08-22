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

  @query('#project-title', true)
  private _nameInput!: HTMLInputElement

  @query('#save-button', true)
  private _saveButton!: HTMLInputElement

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  private _currentPromiseResolve: ((name: string) => void) | null = null
  private _currentPromiseReject: ((err: Error) => void) | null = null

  open(name: string): Promise<string> {
    this._nameInput.value = name || ''
    this._saveButton.disabled = this._nameInput.value === ''
    this._dialog.open()
    this._nameInput.focus()
    return new Promise((resolve, reject) => {
      this._currentPromiseResolve = resolve
      this._currentPromiseReject = reject
    });
  }

  close(): void {
    this._dialog.close()
  }

  _onClosed(): void {
    if (this._currentPromiseReject) {
      this._currentPromiseReject(new Error('Dialog closed'))
    }
    this._currentPromiseReject = null
    this._currentPromiseResolve = null
  }

  _save(): void {
    if (!this._nameInput.value) {
      return
    }
    this._saveButton.disabled = true
    if (this._currentPromiseResolve) {
      this._currentPromiseResolve(this._nameInput.value)
    }
    this._currentPromiseReject = null
    this._currentPromiseResolve = null
  }

  protected override render(): TemplateResult {
    return html` <play-dialog
        dialog-title="Save project"
        description="Start a project from this pen:"
        @closed=${() => this._onClosed()}
      >
        <input type="text"
          id="project-title"
          placeholder="Project Title"
          @keypress=${(e: KeyboardEvent) => {
            this._saveButton.disabled = !this._nameInput.value
            if (e.key === 'Enter') {
              this._save()
            }
          }}
          />
        <input type="button" id="save-button" value="Save" @click=${() => this._save()} />
      </play-dialog>
      `
  }
}
