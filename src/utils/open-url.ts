export function openURL(url: string): void {
  globalThis.open(url, '_blank', 'noopener,noreferrer')
}
