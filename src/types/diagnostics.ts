import type {DevvitUIError} from '@devvit/previews/dist/devvit-blocks-preview.js'
import type {Diagnostic} from 'typescript'

export type Diagnostics = {
  // to-do: unhandled promise rejections.
  /** Uncaught errors thrown when executing the pen program. */
  previewErrs: DevvitUIError[]
  tsErrs: Diagnostic[]
}
