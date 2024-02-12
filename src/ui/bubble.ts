export function Bubble<T>(type: string, detail: T): CustomEvent<T> {
  return new CustomEvent(type, {
    bubbles: true,
    composed: true, // Bubble through shadow DOM.
    detail
  })
}
