import {esbuildPlugin} from '@web/dev-server-esbuild'
import {esbuildConfig} from './esbuild-config.js'
import {monkeyPatchCJS} from './wds-monkey-patch.js'

const base = esbuildConfig('0.0.0', '0.0.1-next-2000-01-01-abcdef123.4')

/** @type {import('@web/test-runner').TestRunnerConfig} */
const config = {
  files: ['src/elements/**/*.test.ts'],
  nodeResolve: true,
  plugins: [
    monkeyPatchCJS(),
    esbuildPlugin({
      banner: `
        Symbol.dispose ??= Symbol('Symbol.dispose');
        Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');
      `,
      define: /** @type {{ [key: string]: string }} */ (base.define),
      loaders: /** @type {{[ext: string]: import('esbuild').Loader}} */ (
        base.loader
      ),
      js: true,
      json: true,
      target: 'es2022',
      ts: true,
      tsconfig: 'src/elements/test/tsconfig.json'
    })
  ],
  filterBrowserLogs: log =>
    typeof log.args[0] !== 'string' ||
    !log.args[0].includes('Lit is in dev mode.'),
  testFramework: {
    // https://mochajs.org/api/mocha
    config: {
      ui: 'tdd' // // Use "test" instead of "it".
    }
  }
}
export default config
