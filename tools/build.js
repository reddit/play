#!/usr/bin/env -S node --no-warnings
// Bundles sources into a single HTML file for distribution and development.
//
// --watch  Run development server. Serve on http://localhost:1234 and reload on
//          code change.
//
// --no-warnings shebang works around JSON import warnings. See
// https://github.com/nodejs/node/issues/27355 and
// https://github.com/nodejs/node/issues/40940.
import esbuild from 'esbuild'
import {JSDOM} from 'jsdom'
import fs from 'node:fs/promises'
import path from 'node:path'
import pkg from '../package.json' with {type: 'json'}
import {esbuildConfig} from './esbuild-config.js'
import {readTSDs} from './tsd.js'

const watch = process.argv.includes('--watch')
const inFilename = 'src/play.html'
const doc = new JSDOM(await fs.readFile(inFilename, 'utf8')).window.document
let srcFilename = /** @type {HTMLScriptElement|null} */ (
  doc.querySelector('script[type="module"][src]')
)?.src
if (!srcFilename) throw Error('missing script source')
srcFilename = `${path.dirname(inFilename)}/${srcFilename}`

/** @type {Parameters<esbuild.PluginBuild['onEnd']>[0]} */
async function pluginOnEnd(result) {
  const copy = /** @type {Document} */ (doc.cloneNode(true))
  const manifestEl = /** @type {HTMLLinkElement|null} */ (
    copy.querySelector('link[href][rel="manifest"]')
  )
  if (manifestEl) {
    const manifestFilename = `${path.dirname(inFilename)}/${manifestEl.href}`
    const manifest = JSON.parse(await fs.readFile(manifestFilename, 'utf8'))
    for (const icon of manifest.icons) {
      if (!icon.src) throw Error('missing manifest icon src')
      if (!icon.type) throw Error('missing manifest icon type')
      const file = await fs.readFile(
        `${path.dirname(manifestFilename)}/${icon.src}`
      )
      icon.src = `data:${icon.type};base64,${file.toString('base64')}`
    }
    if (watch) manifest.start_url = 'http://localhost:1234' // Suppress warning.
    manifest.version = pkg.version
    manifestEl.href = `data:application/json,${encodeURIComponent(JSON.stringify(manifest))}`
  }
  const iconEl = /** @type {HTMLLinkElement|null} */ (
    copy.querySelector('link[href][rel="icon"][type]')
  )
  if (iconEl) {
    const file = await fs.readFile(`${path.dirname(inFilename)}/${iconEl.href}`)
    iconEl.href = `data:${iconEl.type};base64,${file.toString('base64')}`
  }

  let js = ''
  if (watch)
    js +=
      // Use globalThis to avoid conflict with EventSource in protos which are
      // dumped in module scope because esbuild doesn't know the standard
      // EventSource is used.
      "new globalThis.EventSource('/esbuild').addEventListener('change', () => globalThis.location.reload());"

  const outFiles =
    result.outputFiles?.filter(file => file.path.endsWith('.js')) ?? []
  if (outFiles.length > 1) throw Error('cannot concatenate JavaScript files')
  if (outFiles[0]) js += outFiles[0].text

  const scriptEl = /** @type {HTMLScriptElement|null} */ (
    copy.querySelector('script[type="module"][src]')
  )
  if (!scriptEl) throw Error('missing script')
  scriptEl.removeAttribute('src')
  scriptEl.textContent = js
  const outFilename = `dist/${
    watch ? 'index' : `${path.basename(inFilename, '.html')}-v${pkg.version}`
  }.html`
  await fs.mkdir(path.dirname(outFilename), {recursive: true})
  await fs.writeFile(
    outFilename,
    `<!doctype html>${copy.documentElement.outerHTML}`
  )
}

await Promise.all([
  // Generate typing information.
  fs.writeFile(
    'src/bundler/tsd.json',
    JSON.stringify(await readTSDs(), undefined, 2),
    'utf8'
  ),

  // Repackage typescript as an ESM module for the UI tests.
  esbuild.build({
    bundle: true,
    entryPoints: ['node_modules/typescript/lib/typescript.js'],
    external: ['fs', 'inspector', 'os'],
    format: 'esm',
    outfile: 'src/typescript/typescript.js'
  })
])

/** @type {esbuild.BuildOptions} */
const opts = {
  ...esbuildConfig(pkg.version, pkg.devDependencies['@devvit/public-api']),
  bundle: true,
  conditions: watch ? ['development'] : [], // Lit
  external: ['path'], // @typescript/vfs requires path.
  format: 'esm',
  logLevel: `info`, // Print the port and build demarcations.
  sourcemap: 'linked',
  target: 'es2022' // https://esbuild.github.io/content-types/#tsconfig-json
}
/** @type {esbuild.BuildOptions} */
const appOpts = {
  ...opts,
  entryPoints: [srcFilename],
  minify: !watch,
  outdir: 'dist',
  plugins: [{name: 'Play', setup: build => build.onEnd(pluginOnEnd)}],
  write: false // Written by plugin.
}
if (watch) {
  const ctx = await esbuild.context(appOpts)
  await Promise.race([ctx.watch(), ctx.serve({port: 1234, servedir: 'dist'})])
} else {
  const [, , {metafile}] = await Promise.all([
    esbuild.build(appOpts),
    esbuild.build({
      ...opts,
      entryPoints: ['src/index.ts'],
      outfile: 'dist/play.js'
    }),
    esbuild.build({
      ...opts,
      entryPoints: ['src/elements/play-pen/play-pen.ts'],
      metafile: true,
      outdir: 'dist'
    })
  ])
  await fs.writeFile('dist/play-pen.meta.json', JSON.stringify(metafile))
}
