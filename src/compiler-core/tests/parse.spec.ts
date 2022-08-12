import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parse'
describe('Parse', () => {
  describe('interpolation', () => {
    test('simple interpolation', () => {
      let ast = baseParse('{{ message }}')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })

      ast = baseParse('message }}')
      expect(ast.children[0]).toBeUndefined()
    })
  })

  describe('element', () => {
    it('simple element div', () => {
      let ast = baseParse('<div></div>')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div'
      })

      ast = baseParse('<1div></1div>')
      expect(ast.children[0]).toBeUndefined()
    })
  })
})
