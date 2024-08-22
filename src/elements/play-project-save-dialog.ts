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
import {Bubble} from '../utils/bubble.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-project-save-dialog': PlayProjectSaveDialog
  }
}

@customElement('play-project-save-dialog')
export class PlayProjectSaveDialog extends LitElement {
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
      word-break: break-all;
      white-space: pre-line;
      max-height: 100px;
      font-family: var(--font-family-mono);
      font-size: 14px;
      line-height: 1.5;
      background-color: var(--color-secondary-background);
      color: inherit;

      border-radius: var(--radius);
      padding: var(--space);
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

  open(name: string): void {
    this._nameInput.value = name || ''
    this._saveButton.disabled = this._nameInput.value === ''
    this._dialog.open()
    this._nameInput.focus()
  }

  close(): void {
    this._dialog.close()
  }

  _save(): void {
    if (!this._nameInput.value) {
      return
    }
    this._saveButton.disabled = true
    this.dispatchEvent(
      Bubble<string>('save-dialog-submit', this._nameInput.value)
    )
  }

  protected override render(): TemplateResult {
    return html`
      <play-dialog
        dialog-title="Save project"
        description="Start a project from this pen:"
      >
        <input
          type="text"
          id="project-title"
          placeholder="Project Title"
          @keypress=${(e: KeyboardEvent) => {
            this._saveButton.disabled = !this._nameInput.value
            if (e.key === 'Enter') {
              this._save()
            }
          }}
        />
        <input
          type="button"
          id="save-button"
          value="Save"
          @click=${() => this._save()}
        />
      </play-dialog>
    `
  }
}
