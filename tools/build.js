#!/usr/bin/env -S node --no-warnings
// Bundles sources into a single HTML file for distribution and development.
//
// --watch: run development server. Serve on http://localhost:1234 and reload on
//          code change.
//
// --no-warnings shebang works around JSON import warnings. See
// https://github.com/nodejs/node/issues/27355.

import * as esbuild from 'esbuild'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import pkg from '../package.json' assert {type: 'json'}
import manifest from '../src/ui/assets/manifest.json' assert {type: 'json'}
import {readTSDs} from './tsd.js'

const watch = process.argv.includes('--watch')
const timestamp = new Date().toISOString().split(':').slice(0, 2).join('')
const version = `${pkg.version}+${timestamp}` // #version#
const outFilename = path.join(
  'dist',
  watch ? 'index.html' : `play-${version}.html`
)

/** @type {esbuild.Plugin} */
const plugin = {
  name: 'Play',
  setup(build) {
    build.onEnd(pluginOnEnd)
  }
}

/** @type {Parameters<esbuild.PluginBuild['onEnd']>[0]} */
async function pluginOnEnd(result) {
  const manifestCopy = structuredClone(manifest)
  for (const icon of manifestCopy.icons) {
    const file = await fs.readFile(path.join('src', 'ui', 'assets', icon.src)) // #build:assets#
    // Assume PNGs. #icon#
    icon.src = `data:image/png;base64,${file.toString('base64')}`
  }
  if (watch)
    delete (/** @type {{start_url?: string}} */ (manifestCopy).start_url) // Suppress warning.
  manifestCopy.version = version // #version#
  manifestCopy.version_name = `${pkg.version}${watch ? 'dev' : ''}` // #version#
  const manifestURI = `data:application/json,${encodeURIComponent(
    JSON.stringify(manifestCopy)
  )}`

  let js =
    result.outputFiles
      ?.filter(file => file.path.endsWith('.js'))
      .map(file => file.text)
      .join('') ?? ''
  if (watch)
    js += `new EventSource('/esbuild').addEventListener('change', () => location.reload());`

  let html = await fs.readFile(
    path.join('src', 'ui', 'assets', 'play.html'), // #build:assets#
    'utf8'
  )
  html = html
    .replace('{favicon}', () => manifestCopy.icons[0]?.src ?? '')
    .replace('{manifest}', () => manifestURI)
    .replace('{js}', () => js)

  await fs.mkdir('dist', {recursive: true})
  await fs.writeFile(outFilename, html)
}

/** @type {esbuild.BuildOptions} */
const options = {
  bundle: true,
  define: {'globalThis.play.version': `'${version}'`}, // #defines#
  entryPoints: [path.join('src', 'ui', 'components', 'play-app.ts')], // #build:src#
  format: 'esm',
  // Bundle pen worker as text so it can be loaded in a worker.
  loader: {'.worker.min.js': 'text'},
  logLevel: `info`,
  logOverride: {'direct-eval': 'info'}, // Suppress upstream protos eval().
  outdir: 'dist', // #build:dist#
  sourcemap: 'linked',
  plugins: [plugin],
  minify: !watch,
  treeShaking: !watch,
  write: false // Written by plugin.
}

await fs.writeFile(
  path.join('src', 'bundler', 'tsd.json'), // #build:tsd#
  JSON.stringify(await readTSDs(), null, 2)
)

if (watch) {
  const ctx = await esbuild.context(options)
  await Promise.race([
    ctx.watch(),
    ctx.serve({port: 1234, servedir: 'dist'}) // #build:dist#
  ])
} else await esbuild.build(options)
