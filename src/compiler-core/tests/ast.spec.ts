import { NodeTypes } from '../src/ast'
describe('ast', () => {
  test('interpolation node', () => {
    expect(NodeTypes.INTERPOLATION).toBe(0)
    expect(NodeTypes.SIMPLE_EXPRESSION).toBe(1)
  })
})
