import {isCircuitBreaker} from '@devvit/runtime-lite/CircuitBreaker.js'
import {LitElement, css, html, type TemplateResult} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {Diagnostic} from 'typescript'
import ts from 'typescript'
import type {Diagnostics} from '../../types/diagnostics.js'

import './play-button.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-console': PlayConsole
  }
}

@customElement('play-console')
export class PlayConsole extends LitElement {
  @property({attribute: false}) diagnostics?: Diagnostics

  static override styles = css`
    :host {
      height: 320px;
      display: block;
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

      /* Default is middle. */
      vertical-align: top;
    }

    /* Zebra striping. */
    tbody > tr:nth-child(odd) {
      background-color: var(--rpl-neutral-background-weak);
    }

    /* Initial / minimum size to avoid distracting resizing between errors and
       no errors layouts. .details gets the rest. */
    .type {
      width: 100px;
    }
    .name {
      width: 120px;
    }
    .message {
      width: 200px;
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

  protected override render(): TemplateResult<1> {
    const previewErrs = []
    for (const err of this.diagnostics?.previewErrs ?? [])
      previewErrs.push(previewErrRow(err))
    const tsErrs = []
    for (const err of this.diagnostics?.tsErrs ?? []) tsErrs.push(tsErrRow(err))
    return html`<table>
      <thead>
        <tr>
          <th class="type"><div class="resize">Type</div></th>
          <th class="name"><div class="resize">Name</div></th>
          <th class="message"><div class="resize">Message</div></th>
          <th class="details">Details</th>
        </tr>
      </thead>
      <tbody>
        ${tsErrs}${previewErrs}
      </tbody>
    </table>`
  }
}

function previewErrRow(err: unknown): TemplateResult<1> {
  if (!(err instanceof Error))
    return html`<tr>
      <td>Execution</td>
      <td></td>
      <td>${String(err)}</td>
      <td></td>
    </tr>`
  const detail = isCircuitBreaker(err)
    ? // @ts-expect-error
      `${err.cause?.method ? `${err.cause?.method} ` : ''}API call ` +
      'unsupported; this program may run correctly on reddit.com but most ' +
      'APIs are currently unavailable in the playground.'
    : ''
  return html`<tr>
    <td>Execution</td>
    <td>${err.name}</td>
    <td>${err.message}</td>
    <td>${detail || html`<pre>err.stack</pre>`}</td>
  </tr>`
}

function tsErrRow(err: Diagnostic): TemplateResult<1> {
  const type = {
    0: 'Warning',
    1: 'Error',
    2: 'Suggestion',
    3: 'Message'
  }[err.category]
  const line =
    err.start == null
      ? undefined
      : err.file?.getLineAndCharacterOfPosition(err.start).line
  return html`<tr>
    <td>Compile</td>
    <td>${type}</td>
    <td>${line == null ? '' : `Line ${line + 1}`}</td>
    <td>${ts.flattenDiagnosticMessageText(err.messageText, '\n')}</td>
  </tr>`
}
