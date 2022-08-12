import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelpers'

// 转化
export function transform(root, options = {}) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  createRootCodegen(root)

  // 初始化helper
  root.helpers = [...context.helpers.keys()]
}

// 创建 root 代码生成器
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

// 创建上下文
function createTransformContext(root: any, options: any): any {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
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

  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      traverseChildren(node, context)
      break

    default:
      break
  }
}

// 遍历children
function traverseChildren(node: any, context: any) {
  const children = node.children

  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNode(node, context)
  }
}
