import { isString } from '../../shared'
import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING
} from './runtimeHelpers'

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
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break

    default:
      break
  }
}

// 生成组合节点的代码
function genCompoundExpression(node: any, context: any) {
  const { push } = context
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}

// 生成element节点的代码
function genElement(node: any, context: any) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)
  push(')')
}

// 生成 node list 的代码
function genNodeList(nodes, context) {
  const { push } = context

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, context)
    }

    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}

// 生成undefined->null 代码
function genNullable(args: any) {
  return args.map((arg) => arg || 'null')
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
