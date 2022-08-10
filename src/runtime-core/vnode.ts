/**
 * @file 创建 虚拟节点 vnode 模块
 * @author zhaoyimin
 */

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null
  }

  return vnode
}
