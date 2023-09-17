#!/usr/bin/env -S node --no-warnings
// Bundles sources into a single HTML file for distribution and development.
//
// --watch: run development server. Serve on http://localhost:1234 and reload on
//          code change.
//
// --no-warnings shebang works around JSON import warnings. See
// https://github.com/nodejs/node/issues/27355.

import esbuild from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import pkg from '../package.json' assert {type: 'json'}
import manifest from '../src/ui/assets/manifest.json' assert {type: 'json'}
import {readTSDs} from './tsd.js'

const watch = process.argv.includes('--watch')

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
    icon.src = `data:${icon.type};base64,${file.toString('base64')}`
  }
  if (watch)
    delete (/** @type {{start_url?: string}} */ (manifestCopy).start_url) // Suppress warning.
  manifestCopy.version = pkg.version
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
  const outFilename = path.join(
    'dist',
    watch ? 'index.html' : `play-${pkg.version}.html`
  )
  await fs.writeFile(outFilename, html)
}

await fs.writeFile(
  path.join('src', 'bundler', 'tsd.json'), // #build:tsd#
  JSON.stringify(await readTSDs(), null, 2)
)

/** @type {esbuild.BuildOptions} */
const opts = {
  bundle: true,
  define: {'globalThis.play.version': `'${pkg.version}'`}, // #defines#
  format: 'esm',
  // Bundle pen worker as text so it can be loaded in a worker.
  loader: {'.worker.min.js': 'text'},
  logLevel: `info`, // Print the port and build demarcations.
  outdir: 'dist', // #build:dist#
  sourcemap: 'linked'
}
const appOpts = {
  ...opts,
  entryPoints: [path.join('src', 'ui', 'components', 'play-app.ts')], // #build:src#
  minify: !watch,
  plugins: [plugin],
  write: false // Written by plugin.
}
if (watch) {
  const ctx = await esbuild.context(appOpts)
  await Promise.race([
    ctx.watch(),
    ctx.serve({port: 1234, servedir: 'dist'}) // #build:dist#
  ])
} else
  await Promise.all([
    esbuild.build(appOpts),
    esbuild.build({
      ...opts,
      entryPoints: [path.join('src', 'ui', 'components', 'play-pen.ts')] // #build:src#
    })
  ])
