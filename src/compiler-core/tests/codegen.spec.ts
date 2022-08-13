import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformExpression } from '../transforms/transformExpression'
import { transformElement } from '../transforms/transformElement'
import { transformText } from '../transforms/transformText'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')
    transform(ast)
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{message}}')
    transform(ast, {
      nodeTransforms: [transformExpression]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast: any = baseParse('<div>hi,{{message}}test</div>')
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element in element', () => {
    const ast: any = baseParse('<div>hi,{{message}}<p>count</p></div>')
    transform(ast, {
      nodeTransforms: [transformExpression, transformElement, transformText]
    })

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })
})
