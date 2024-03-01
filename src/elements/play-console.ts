import {isCircuitBreaker} from '@devvit/runtime-lite/types/CircuitBreaker.js'
import type {DevvitUIError} from '@devvit/ui-renderer/client/devvit-custom-post.js'
import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult
} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {Diagnostics} from '../types/diagnostics.js'
import ts from '../typescript/typescript.js'
import {Bubble} from '../utils/bubble.js'
import {cssReset} from '../utils/css-reset.js'

declare global {
  interface HTMLElementEventMap {
    'open-line': CustomEvent<OpenLine>
  }
  interface HTMLElementTagNameMap {
    'play-console': PlayConsole
  }
}

export type OpenLine = {
  /** One-based index. */
  line: number
  /** Zero-based index. */
  char: number
}

@customElement('play-console')
export class PlayConsole extends LitElement {
  static override readonly styles: CSSResultGroup = css`
    ${cssReset}

    :host {
      height: 100%;
      padding-left: 16px;
      padding-right: 16px;
      display: block;
      overflow: auto;
      background-color: var(--color-background);
      font-family: var(--font-family-sans);
    }
    table {
      height: 100%;
      width: 100%;
      border-spacing: 0;
    }
    thead tr {
      text-align: left;
    }

    tbody tr:hover {
      background-color: var(--color-info-background);
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
      background-color: var(--color-info-background-hovered);
    }
    tbody > tr:nth-child(odd):hover {
      background-color: var(--color-info-background);
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

    a {
      cursor: pointer;
      text-decoration: underline;
    }
  `

  @property({attribute: false}) diagnostics?: Diagnostics

  protected override render(): TemplateResult {
    const previewErrs = []
    for (const err of this.diagnostics?.previewErrs ?? [])
      previewErrs.push(previewErrRow(err))
    const tsErrs = []
    for (const err of this.diagnostics?.tsErrs ?? [])
      tsErrs.push(this.tsErrRow(err))
    return html`
      <table>
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
      </table>
    `
  }

  tsErrRow(err: ts.Diagnostic): TemplateResult<1> {
    const type = {0: 'Warning', 1: 'Error', 2: 'Suggestion', 3: 'Message'}[
      err.category
    ]
    const line =
      err.start == null
        ? undefined
        : err.file?.getLineAndCharacterOfPosition(err.start)
    return html`
      <tr>
        <td>Compile</td>
        <td>${type}</td>
        <td>
          ${line == null
            ? ''
            : html`
                <a
                  @click=${() =>
                    this.dispatchEvent(
                      Bubble<OpenLine>('open-line', {
                        line: line.line + 1,
                        char: line.character
                      })
                    )}
                  >Line ${line.line + 1}</a
                >
              `}
        </td>
        <td>${ts.flattenDiagnosticMessageText(err.messageText, '\n')}</td>
      </tr>
    `
  }
}

function previewErrRow(err: DevvitUIError): TemplateResult<1> {
  const detail =
    err.type === 'UnhandledRejection'
      ? 'Unhandled promise rejection; `await` asynchronous execution and ' +
        'catch errors.'
      : isCircuitBreaker(err.err)
        ? 'Unsupported plugin: ' +
          `${
            err.err.cause?.method ? `${err.err.cause.method} ` : ''
          }API call ` +
          'unavailable. This program may run correctly on reddit.com but most ' +
          'Context and other Devvit APIs are not yet supported in the playground.'
        : ''
  if (!isErrorLike(err.err))
    return html`
      <tr>
        <td>Execution</td>
        <td></td>
        <td>${String(err.err)}</td>
        <td>${detail}</td>
      </tr>
    `
  return html`
    <tr>
      <td>Execution</td>
      <td>${err.err.name}</td>
      <td>${err.err.message}</td>
      <td>
        ${detail}
        <pre>${err.err.stack}</pre>
      </td>
    </tr>
  `
}

// BrowserLiteWorker may report objects that are Error-like but that aren't
// instances of Error.
function isErrorLike(err: unknown): err is Error & Record<never, never> {
  return (
    err != null &&
    typeof err === 'object' &&
    ('cause' in err || 'message' in err || 'stack' in err)
  )
}
