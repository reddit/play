/** esbuild is configured to use the text-loader for example imports. */
declare module '*.example.js' {
  const src: string
  export = src
}
