// tools/build configures esbuild loaders for these extensions.

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
