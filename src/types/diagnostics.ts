import type {DevvitUIError} from '@devvit/ui-renderer/client/devvit-custom-post.js'
import type {Diagnostic} from 'typescript'

export type Diagnostics = {
  // to-do: unhandled promise rejections.
  /** Uncaught errors thrown when executing the pen program. */
  previewErrs: DevvitUIError[]
  tsErrs: Diagnostic[]
}
