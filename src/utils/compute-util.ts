// to-do: compute-go doesn't seem to replace old bundles. Generate a unique
//        hostname for each new build.
export function newHostname(name: string, version: number): string {
  return `${name.toLocaleLowerCase().replace(/[^a-z0-9]/, '') || 'untitled'}-${version}-local`
}
