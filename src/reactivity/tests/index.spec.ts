import { add } from '../index'

it('init', () => {
  expect(true).toBe(true)
})

it('test add function ', () => {
  const res = add(1, 1)
  expect(res).toBe(2)
})
