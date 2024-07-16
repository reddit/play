import {debounce} from './debounce.js'
import {expect, it, describe} from 'vitest'

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
    fn(2)
    await new Promise(resolve => setTimeout(resolve, 0))
    fn(3)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(out.val).toBe(3)

    fn(4)
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(out.val).toBe(4)
  })
})
