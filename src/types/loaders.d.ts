// tools/build configures esbuild loaders for these extensions.

declare module '*.css' {
  const text: string
  export = text
}

declare module '*.example.tsx' {
  const text: string
  export = text
}

declare module '*.svg' {
  const text: string
  export = text
}

declare module '*.worker.min.js' {
  // This import must be wildcarded for @web/dev-server-esbuild.
  export = {default: string}
}
