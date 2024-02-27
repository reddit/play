import {esbuildPlugin} from '@web/dev-server-esbuild'
import {esbuildConfig} from './esbuild-config.js'

const base = esbuildConfig('0.0.0', '0.0.1-next-2000-01-01-abcdef123.4')

export default {
  files: ['src/elements/**/*.test.ts'],
  nodeResolve: true,
  plugins: [
    esbuildPlugin({
      ...base,
      loaders: /** @type {{[ext: string]: import('esbuild').Loader}} */ (
        base.loader
      ),
      target: 'auto',
      ts: true,
      tsconfig: 'src/elements/test/tsconfig.json'
    })
  ],
  testFramework: {
    // https://mochajs.org/api/mocha
    config: {
      ui: 'tdd' // // Use "test" instead of "it".
    }
  }
}
