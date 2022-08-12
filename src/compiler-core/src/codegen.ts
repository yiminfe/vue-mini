import { NodeTypes } from './ast'
import { helperMapName, TO_DISPLAY_STRING } from './runtimeHelpers'

// 代码生成器
export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  // 生成function之前的代码
  genFunctionPreamble(ast, context)

  // 方法名
  const functionName = 'render'
  // 参数
  const args = ['_ctx', '_cache']
  // 拼接参数
  const signature = args.join(', ')

  push(`function ${functionName}(${signature}){`)
  push('return ')
  genNode(ast.codegenNode, context)
  push('}')

  return {
    code: context.code
  }
}

// 生成function之前的代码
function genFunctionPreamble(ast, context) {
  const { push } = context
  const VueBinging = 'Vue'
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`
  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}

// 创建代码生成的上下文
function createCodegenContext(): any {
  const context = {
    code: '',
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }

  return context
}

// 生成节点代码
function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break

    default:
      break
  }
}

// 生成表达式的代码
function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}

// 生成插值的代码
function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}

// 生成文本字符串的代码
function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}
