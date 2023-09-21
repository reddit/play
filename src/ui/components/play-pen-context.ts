import {LinkedBundle} from '@devvit/protos'
import {createContext} from '@lit-labs/context'
import type {VirtualTypeScriptEnvironment} from '@typescript/vfs'
import type {ColorScheme} from '../../types/color-scheme.js'

export const penCtx = <const>{
  /** Allow loading and saving from LocalStorage. */
  allowStorage: createContext<boolean>('play-pen-allow-storage'),
  /**
   * Allow loading and saving from URL hash. Loading from hash has precedence
   * over LocalStorage.
   */
  allowURL: createContext<boolean>('play-pen-allow-url'),
  /** Program executable. */
  bundle: createContext<LinkedBundle | undefined>('play-pen-bundle'),
  env: createContext<VirtualTypeScriptEnvironment>('play-pen-env'),
  /** Program title. */
  name: createContext<string>('play-pen-name'),
  /** Execution color scheme. */
  scheme: createContext<ColorScheme | undefined>('play-pen-scheme'),
  /** Program source code. Undefined when not restored. */
  src: createContext<string | undefined>('play-pen-src'),
  /** Program source code reset state. */
  template: createContext<string | undefined>('play-pen-template')
}
