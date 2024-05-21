import * as tsvfs from '@typescript/vfs'
import ts from '../typescript/typescript.js'
import tsd from './tsd.json' assert {type: 'json'}

export const appEntrypointFilename = '/src/main.tsx'

export function newTSEnv(): tsvfs.VirtualTypeScriptEnvironment {
  const system = tsvfs.createSystem(new Map())
  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    [],
    ts,
    compilerOpts()
  )
  for (const [name, data] of virtualFiles().entries())
    env.createFile(name, data)
  return env
}

export function compile(env: tsvfs.VirtualTypeScriptEnvironment): string {
  const src =
    env.languageService.getEmitOutput(appEntrypointFilename).outputFiles[0]
      ?.text ?? ''
  // Adapt bundle CommonJS output to format expected by our runtimes.
  // This is a light hack that satisfies two different runtime needs:
  // * runtime-lite needs `exports` to be defined and aliased to `module.exports` like so.
  // * Node wraps the file in a function that provides `module` and `exports` already, so
  //   needs them not to be overwritten.
  return src.replace(
    /^"use strict";/,
    '"use strict"; if (!module.exports) { module.exports = {}; var exports = module.exports; }\n'
  )
}

export function getSource(env: tsvfs.VirtualTypeScriptEnvironment): string {
  return env.getSourceFile(appEntrypointFilename)?.text ?? ''
}

export function setSource(
  env: tsvfs.VirtualTypeScriptEnvironment,
  src: string
): void {
  env.updateFile(appEntrypointFilename, src || ' ') // empty strings trigger file deletion!
}

function virtualFiles(): Map<string, string> {
  return new Map([
    ...Object.entries(tsd),
    [appEntrypointFilename, ' '] // empty files are immediately deleted!
  ])
}

function compilerOpts(): ts.CompilerOptions {
  // Match config used in production apps.
  return {
    jsx: ts.JsxEmit.React,
    jsxFactory: 'Devvit.createElement',
    jsxFragmentFactory: 'Devvit.Fragment',

    lib: ['ES2020', 'WebWorker'],

    module: ts.ModuleKind.CommonJS,

    // Maximize friendly type checking.
    noImplicitOverride: true,
    strict: true,

    // Provided types are already checked.
    skipLibCheck: true,
    skipDefaultLibCheck: true,

    // Improve `debugger` support.
    inlineSources: true,
    inlineSourceMap: true,

    target: ts.ScriptTarget.ES2020
  }
}
