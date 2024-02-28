import type {DevvitUIError} from '@devvit/ui-renderer/client/devvit-custom-post.js'
import ts from '../typescript/typescript.js'

export type Diagnostics = {
  // to-do: unhandled promise rejections.
  /** Uncaught errors thrown when executing the pen program. */
  previewErrs: DevvitUIError[]
  tsErrs: ts.Diagnostic[]
}
