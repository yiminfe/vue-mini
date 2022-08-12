// 转化
export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)
}

// 创建 root 代码生成器
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

// 创建上下文
function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }

  return context
}

// 深度优先遍历
function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node)
  }

  traverseChildren(node, context)
}

// 遍历children
function traverseChildren(node: any, context: any) {
  const children = node.children

  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      traverseNode(node, context)
    }
  }
}
