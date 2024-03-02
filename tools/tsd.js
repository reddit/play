import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

// See node_modules/@typescript/vfs/dist/vfs.cjs.development.js. This is
// everything ES2020 (matches tsconfig) and older as newer definitions appear to
// reference older.
const tslibFilenames = [
  'lib.d.ts',
  'lib.decorators.d.ts',
  'lib.decorators.legacy.d.ts',
  'lib.dom.d.ts',
  'lib.dom.iterable.d.ts',
  'lib.webworker.d.ts',
  'lib.webworker.importscripts.d.ts',
  'lib.webworker.iterable.d.ts',
  'lib.scripthost.d.ts',
  'lib.es5.d.ts',
  'lib.es6.d.ts',
  'lib.es2015.collection.d.ts',
  'lib.es2015.core.d.ts',
  'lib.es2015.d.ts',
  'lib.es2015.generator.d.ts',
  'lib.es2015.iterable.d.ts',
  'lib.es2015.promise.d.ts',
  'lib.es2015.proxy.d.ts',
  'lib.es2015.reflect.d.ts',
  'lib.es2015.symbol.d.ts',
  'lib.es2015.symbol.wellknown.d.ts',
  'lib.es2016.array.include.d.ts',
  'lib.es2016.d.ts',
  'lib.es2016.full.d.ts',
  'lib.es2017.d.ts',
  'lib.es2017.date.d.ts',
  'lib.es2017.full.d.ts',
  'lib.es2017.intl.d.ts',
  'lib.es2017.object.d.ts',
  'lib.es2017.sharedmemory.d.ts',
  'lib.es2017.string.d.ts',
  'lib.es2017.typedarrays.d.ts',
  'lib.es2018.asyncgenerator.d.ts',
  'lib.es2018.asynciterable.d.ts',
  'lib.es2018.d.ts',
  'lib.es2018.full.d.ts',
  'lib.es2018.intl.d.ts',
  'lib.es2018.promise.d.ts',
  'lib.es2018.regexp.d.ts',
  'lib.es2019.array.d.ts',
  'lib.es2019.d.ts',
  'lib.es2019.full.d.ts',
  'lib.es2019.intl.d.ts',
  'lib.es2019.object.d.ts',
  'lib.es2019.string.d.ts',
  'lib.es2019.symbol.d.ts',
  'lib.es2020.bigint.d.ts',
  'lib.es2020.d.ts',
  'lib.es2020.date.d.ts',
  'lib.es2020.full.d.ts',
  'lib.es2020.intl.d.ts',
  'lib.es2020.number.d.ts',
  'lib.es2020.promise.d.ts',
  'lib.es2020.sharedmemory.d.ts',
  'lib.es2020.string.d.ts',
  'lib.es2020.symbol.wellknown.d.ts'
]

/**
 * Generates a map of TypeScript filenames to definitions in
 * src/bundler/tsd.json.
 * @return {Promise<{[filename: string]: string}>}
 */
export async function readTSDs() {
  /** @type {{[filename: string]: string}} */
  const tsdByFilename = {}

  const tsDir = path.dirname(require.resolve('typescript'))
  for (const file of tslibFilenames) {
    tsdByFilename[`/${file}`] = await fs.readFile(
      path.join(tsDir, file),
      'utf8'
    )
  }

  const apiDir = path.dirname(require.resolve('@devvit/public-api'))
  tsdByFilename['/node_modules/@devvit/public-api/index.d.ts'] =
    await fs.readFile(path.join(apiDir, 'public-api.d.ts'), 'utf8')

  return tsdByFilename
}
