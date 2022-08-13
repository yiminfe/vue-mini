/**
 * @file 转换插值表达式
 * @author zhaoyimin
 */

import { NodeTypes } from '../ast'

// 转换成表达式
export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content)
  }
}

// 处理表达式
function processExpression(node: any) {
  node.content = `_ctx.${node.content}`

  return node
}
