import { CREATE_ELEMENT_VNODE } from './runtimeHelpers'

export const enum NodeTypes {
  INTERPOLATION, // 插值节点
  SIMPLE_EXPRESSION, // 插值节点的表达式
  ELEMENT, // element 节点
  TEXT, // 文本节点
  ROOT, // 根节点
  COMPOUND_EXPRESSION // 组合类型：text and 插值节点
}

// 调用创建你vnode
export function createVNodeCall(context, tag, props, children) {
  context.helper(CREATE_ELEMENT_VNODE)

  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children
  }
}
