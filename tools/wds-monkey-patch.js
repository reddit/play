/**
 * This resolves some import errors when testing due to some CJS dependencies
 * that are not being properly resolved.  The content of these modules are not
 * currently being utilized when executing the tests.
 * @returns {import('@web/test-runner').TestRunnerPlugin}
 */
export const monkeyPatchCJS = () => ({
  name: 'CJS Import Patcher',
  serve(context) {
    if (context.path.endsWith('buffer/index.js')) {
      return 'export class Buffer {}'
    } else if (context.path.endsWith('readable-stream/lib/ours/index.js')) {
      return `
            export class Readable {};
            export class Writable {};
          `
    } else if (context.path.endsWith('eventemitter3/index.js')) {
      return 'export default class EventEmitter {};'
    }
  }
})
