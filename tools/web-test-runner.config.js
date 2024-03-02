import {esbuildPlugin} from '@web/dev-server-esbuild'
import {esbuildConfig} from './esbuild-config.js'

/** @type {any} */
const base = esbuildConfig('0.0.0', '0.0.1-next-2000-01-01-abcdef123.4')

/** @type {import('@web/test-runner').TestRunnerConfig} */
const config = {
  files: ['src/elements/**/*.test.ts'],
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      define: base.define,
      loaders: /** @type {{[ext: string]: import('esbuild').Loader}} */ (
        base.loader
      ),
      target: 'auto',
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
