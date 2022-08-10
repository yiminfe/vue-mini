import { hasOwn, camelize, toHandlerKey } from '../index'

describe('index test', () => {
  it('should call true when hasOwn', () => {
    const user = {
      age: 1
    }
    expect(hasOwn(user, 'age')).toBe(true)
  })

  it('should call addFoo when camelize', () => {
    expect(camelize('add-foo')).toBe('addFoo')
    expect(camelize('addfoo')).toBe('addfoo')
    expect(camelize('add-1oo-')).toBe('add1oo-')
  })

  it('should call onAddFoo when toHandlerKey', () => {
    expect(toHandlerKey('addFoo')).toBe('onAddFoo')
    expect(toHandlerKey('')).toBe('')
  })
})
