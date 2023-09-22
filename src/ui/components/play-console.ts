import {consume} from '@lit-labs/context'
import {LitElement, css, html} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {Diagnostics} from '../../types/diagnostics.js'
import {penCtx} from './play-pen-context.js'

import './play-button.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-console': PlayConsole
  }
}

@customElement('play-console')
export class PlayConsole extends LitElement {
  @consume({context: penCtx.diagnostics, subscribe: true})
  @property({attribute: false})
  diagnostics?: Diagnostics

  static override styles = css`
    .play-console {
      height: 320px;
      overflow: auto;
      background-color: var(--rpl-neutral-background);
    }
    table {
      height: 100%;
      width: 100%;
    }
    thead tr {
      text-align: left;
    }

    tbody > tr:hover {
      background-color: var(--rpl-neutral-background-weak-hovered);
    }

    th,
    td {
      padding-bottom: 12px;
      padding-left: 8px;
      padding-right: 8px;
      padding-top: 12px;
      vertical-align: top;
    }

    tbody tr:nth-of-type(odd) {
      background-color: var(--rpl-neutral-background-weak);
    }

    .name {
      /** Initial / minimum size to avoid snapp. */
      width: 120px;
      min-width: 32px;
    }
    .message {
      width: 200px;
      min-width: 32px;
    }

    .resize {
      /* This is just a resizable div. Don't let it get smaller than the minimum
         width of the cel. */
      min-width: 100%;

      /** Allow resize. */
      overflow: hidden;
      resize: horizontal;
    }

    pre {
      /* Remove default margin. */
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
      margin-top: 0;
    }
  `
  protected override render() {
    const errs = []
    for (const err of this.diagnostics?.previewErrs ?? []) errs.push(row(err))
    return html`<div class="play-console">
      <table>
        <thead>
          <tr>
            <th class="name"><div class="resize">Name</div></th>
            <th class="message"><div class="resize">Message</div></th>
            <th class="details">Details</th>
          </tr>
        </thead>
        <tbody>
          ${errs}
        </tbody>
      </table>
    </div>`
  }
}

function row(err: unknown) {
  if (!(err instanceof Error))
    return html`<tr>
      <td></td>
      <td>${String(err)}</td>
      <td></td>
    </tr>`
  return html`<tr>
    <td>${err.name}</td>
    <td>${err.message}</td>
    <td><pre>${err.stack}</pre></td>
  </tr>`
}
