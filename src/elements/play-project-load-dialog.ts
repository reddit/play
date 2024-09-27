import {
  css,
  type CSSResultGroup,
  html,
  LitElement,
  type TemplateResult
} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {PlayDialog} from './play-dialog/play-dialog.js'
import {cssReset} from '../utils/css-reset.js'

import './play-button.js'
import './play-dialog/play-dialog.js'
import './play-toast.js'
import type {PlayProject} from '../storage/project-storage-client.js'
import {ProjectManager} from '../storage/project-manager.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-project-load-dialog': PlayProjectLoadDialog
  }
}

@customElement('play-project-load-dialog')
export class PlayProjectLoadDialog extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    p {
      color: inherit;
      /* RPL/Body Regular/14-BodyReg */
      font-family: var(--font-family-sans);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }

    select {
      width: 100%;
      font-family: var(--font-family-sans);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
      letter-spacing: -0.2px;
    }
  `

  @property() src: string = ''

  @state() private _loading = false
  @state() private _projects: PlayProject[] = []

  @query('#project-select')
  private _projectSelect!: HTMLSelectElement

  @query('play-dialog', true)
  private _dialog!: PlayDialog

  @property({attribute: 'project-manager', type: ProjectManager})
  projectManager!: ProjectManager

  async open(): Promise<void> {
    this._loading = true
    this._dialog.open()
    this._projects = await this.projectManager.getProjectList()
    this._loading = false
  }

  close(): void {
    this._dialog.close()
  }

  async _load(): Promise<void> {
    const projectId = this._projectSelect.value
    if (!projectId) return
    const project = await this.projectManager.loadProject(projectId)

    // TODO: this assumes just one file for Play.
    const fileContent =
      (project.files || []).length > 0
        ? new TextDecoder().decode(project.files[0]?.content)
        : ''

    this.dispatchEvent(
      new CustomEvent('edit-src', {
        detail: fileContent,
        bubbles: true,
        composed: true
      })
    )
    this.dispatchEvent(
      new CustomEvent('edit-name', {
        detail: project.name,
        bubbles: true,
        composed: true
      })
    )
    this.close()
  }

  protected override render(): TemplateResult {
    return html`
      <play-dialog
        dialog-title="Load project"
        description="Load one of your saved projects:"
      >
        ${this._loading
          ? html`<p>Loading projects...</p>`
          : html`<p>Choose a project to load:</p>
              ${this._projects.length > 0
                ? html`
                    <div>
                      <select id="project-select" size="8">
                        ${this._projects.map(
                          project =>
                            html`<option value="${project.id}">
                              ${project.name}
                            </option>`
                        )}
                      </select>
                    </div>
                  `
                : html`<p>No projects available</p>`}`}
        <div>
          <input
            type="button"
            id="load-button"
            value="Load"
            @click=${() => this._load()}
          />
        </div>
      </play-dialog>
    `
  }
}
