import type {Diagnostic} from 'typescript'
import type {PreviewError} from './preview-error.js'

export type Diagnostics = {
  // to-do: unhandled promise rejections.
  /** Uncaught errors thrown when executing the pen program. */
  previewErrs: PreviewError[]
  tsErrs: Diagnostic[]
}
