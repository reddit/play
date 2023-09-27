import type {Diagnostic} from 'typescript'

export type Diagnostics = {
  // to-do: unhandled promise rejections.
  /** Uncaught errors thrown when executing the pen program. */
  previewErrs: unknown[]
  tsErrs: Diagnostic[]
}
