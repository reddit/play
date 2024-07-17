import {debounce} from './debounce.js'
import {expect, it, describe, vi} from 'vitest'

describe('debounce', () => {
  it('executes with a delay', async () => {
    const out = {val: 0}
    const fn = debounce((val: number) => (out.val = val), 100)
    fn(1)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(out.val).toBe(0)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(out.val).toBe(1)
  })

  it('executes the last call of a series', async () => {
    const out = {val: 0}
    const fn = debounce((val: number) => (out.val = val), 100)
    fn(1)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(out.val).toBe(0)

    fn(2)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(out.val).toBe(0)

    fn(3)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(out.val).toBe(3)

    fn(4)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(out.val).toBe(4)
  })

  it('has a cleanup function that cancels the delayed execution', async () => {
    const innerFn = vi.fn()
    const debouncedFn = debounce(innerFn, 1000)
    const cleanupFn = debouncedFn(1)
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(innerFn).toBeCalledTimes(0)
    cleanupFn()
    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(innerFn).toBeCalledTimes(0)
  })
})
