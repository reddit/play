/** Delay function execution until after the invocations stopped. */
export const debounce = <T extends unknown[]>(
  fn: (...args: T) => void,
  period: number
): ((...args: T) => void) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn(...args)
    }, period)
  }
}
