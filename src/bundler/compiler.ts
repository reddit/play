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
  // 1. runtime-lite needs `exports` to be defined and aliased to `module.exports` like so.
  // 2. Node wraps the bundle's code in this function:
  //
  //    (function(exports, require, module, __filename, __dirname) {
  //      // [ bundle code here ]
  //    });
  //
  //    We can't overwrite `module.exports` (the resulting bundle won't actually export what
  //    it needs to), and we can't declare `exports` with const/let ("already been declared").
  return src.replace(
    /^"use strict";/,
    '"use strict"; if (!module.exports) { module.exports = {}; var exports = module.exports; };'
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
    // Note: this only works for play's local runtime, not for the remote/node runtime.
    // For remote/node, we pull this sourcemap off the result and send it separately.
    inlineSources: true,
    inlineSourceMap: true,

    target: ts.ScriptTarget.ES2020
  }
}
