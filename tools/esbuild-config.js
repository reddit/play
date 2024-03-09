/**
 * Just the configs that can be shared with test:ui. See
 * https://modern-web.dev/docs/dev-server/plugins/esbuild. Note that esbuild
 * uses `loader` whereas @web/dev-server-esbuild uses `loaders`.
 * @arg {string} playVersion
 * @arg {string} devvitVersion
 * @return {import('esbuild').BuildOptions}
 */
export function esbuildConfig(playVersion, devvitVersion) {
  return {
    // See defines.d.ts.
    define: {
      devvitVersion: `'${devvitVersion}'`,
      playVersion: `'${playVersion}'`
    },
    // See loaders.d.ts.
    loader: {
      // Bundle templates for loading in pens and bundle pen worker as text so it
      // can be loaded in a worker.
      '.example.tsx': 'text',
      '.worker.min.js': 'text',

      '.css': 'text',
      '.svg': 'text'
    }
  }
}
