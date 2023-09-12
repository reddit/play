/** esbuild is configured to use the text-loader for worker imports. */
declare module '*.worker.min.js' {
  const text: string
  export = text
}
