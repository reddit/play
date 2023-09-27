// esbuild is configured to use the text-loader for examples and worker imports.
// See tools/build.js

declare module '*.css' {
  const text: string
  export = text
}

declare module '*.example.js' {
  const text: string
  export = text
}

declare module '*.svg' {
  const text: string
  export = text
}

declare module '*.worker.min.js' {
  const text: string
  export = text
}
