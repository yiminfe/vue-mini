/**
 * @file 转换element节点
 * @author zhaoyimin
 */

import { createVNodeCall, NodeTypes } from '../ast'

// 转换element
export function transformElement(node, context) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // tag
      const vnodeTag = `'${node.tag}'`

      // props
      let vnodeProps

      // children
      const children = node.children
      const vnodeChildren = children[0]

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      )
    }
  }
}
