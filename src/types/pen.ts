import type {LinkedBundle} from '@devvit/protos'
import * as tsvfs from '@typescript/vfs'
import {newTSEnv} from '../bundler/compiler.js'

export type Pen = {
  env: tsvfs.VirtualTypeScriptEnvironment
  bundle?: LinkedBundle | undefined
}

export function Pen(): Pen {
  return {env: newTSEnv()}
}
