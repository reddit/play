/**
 * Just the configs that can be shared with test:ui. See
 * https://modern-web.dev/docs/dev-server/plugins/esbuild. Note that esbuild
 * uses `loader` whereas @web/dev-server-esbuild uses `loaders`.
 * @arg {string} playVersion
 * @arg {string} devvitVersion
 * @ret {import('esbuild').BuildOptions}
 */
export function esbuildConfig(playVersion, devvitVersion) {
  return {
    define: {
      'globalThis.playVersion': `'${playVersion}'`,
      'globalThis.devvitVersion': `'${devvitVersion}'`
    }, // See defines.d.ts.
    loader: {
      '.css': 'text',
      // Bundle templates for loading in pens and bundle pen worker as text so it
      // can be loaded in a worker.
      '.example.tsx': 'text',
      '.svg': 'text',
      '.worker.min.js': 'text'
    }
  }
}
