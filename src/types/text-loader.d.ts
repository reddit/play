// esbuild is configured to use the text-loader for examples and worker imports.
// See tools/build.js

declare module '*.css' {
  const styles: string
  export = styles
}

declare module '*.example.js' {
  const src: string
  export = src
}

declare module '*.worker.min.js' {
  const text: string
  export = text
}
