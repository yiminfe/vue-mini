import { hasOwn } from '../index'

describe('hasOwn test', () => {
  it('should call true when hasOwn', () => {
    const user = {
      age: 1
    }
    expect(hasOwn(user, 'age')).toBe(true)
  })
})
