import { isProxy, isReadonly, shallowReadonly } from '../src/reactive'

describe('shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shallowReadonly({ n: { foo: 1 } })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)

    expect(isProxy(props)).toBe(true)
  })

  it('should call console.warn when set', () => {
    console.warn = jest.fn()
    const user = shallowReadonly({
      age: 10
    })

    user.age = 11
    expect(console.warn).toHaveBeenCalled()
  })

  it('should call console.warn when set', () => {
    console.warn = jest.fn()
    let age
    const res = shallowReadonly(age)
    expect(res).toBeUndefined()
    expect(console.warn).toHaveBeenCalled()
  })
})
