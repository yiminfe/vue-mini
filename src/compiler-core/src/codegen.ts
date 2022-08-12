// 代码生成器
export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  push('return ')

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

// 创建代码生成的上下文
function createCodegenContext(): any {
  const context = {
    code: '',
    push(source) {
      context.code += source
    }
  }

  return context
}

// 生成 ast 上的节点
function genNode(node: any, context) {
  const { push } = context
  push(`'${node.content}'`)
}
