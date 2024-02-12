import type {WorkerErrorType} from '@devvit/runtime-lite/client/BrowserLiteClient.js'

export type PreviewError = {type: WorkerErrorType; err: unknown}
