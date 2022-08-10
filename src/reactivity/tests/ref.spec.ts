import { effect } from '../effect'
import { reactive } from '../reactive'
import { isRef, ref, unRef } from '../ref'
describe('ref', () => {
  it('happy path', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it('should be ref', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it('should make nested properties ref', () => {
    const a = ref({
      count: 1
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it('isRef', () => {
    const a = ref(1)
    const user = reactive({
      age: 1
    })
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
    expect(isRef(user)).toBe(false)
  })

  it('unRef', () => {
    const a = ref(1)
    const obj = {
      a: 100
    }
    const b = ref(obj)

    const unA = unRef(a)
    const unB = unRef(b)
    const unObj = unRef(obj)
    const unNumber = unRef(1)
    expect(unA).toBe(1)
    expect(unB.a).toBe(obj.a)
    expect(unObj).toBe(obj)
    expect(unNumber).toBe(1)
  })
})
