import * as tsvfs from '@typescript/vfs'
import * as ts from 'typescript'
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
  // Adapt bundle CommonJS output to format expected by runtime-lite.
  return src.replace(
    /^"use strict";/,
    '"use strict"; module.exports = {}; const {exports} = module;'
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
