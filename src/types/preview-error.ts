import type {WorkerErrorType} from '@devvit/runtime-lite/BrowserLiteClient.js'

export type PreviewError = {type: WorkerErrorType; err: unknown}
