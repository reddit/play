/** Delay function execution until after the invocations stopped. */
export type DebounceCleanupFn = () => void

export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  period: number
): ((...args: T) => DebounceCleanupFn) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, period)
    return () => {
      clearTimeout(timeout)
    }
  }
}
