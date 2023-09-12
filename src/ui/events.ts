export const SourceChanged = 'SourceChanged'
export function SourceChangedEvent(src: string): CustomEvent<{src: string}> {
  return new CustomEvent(SourceChanged, {
    bubbles: true,
    composed: true,
    detail: {src}
  })
}
