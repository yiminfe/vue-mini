/**
 * @file 创建 App 模块
 * @author zhaoyimin
 */

import { render } from './renderer'
import { createVNode } from './vnode'

// 创建 App
export function createApp(rootComponent) {
  return {
    // 挂载根节点
    mount(rootContainer) {
      // 根据根组件，创建虚拟节点
      const vnode = createVNode(rootComponent)

      // 根据虚拟节点 and 根节点 旋绕 dom
      render(vnode, rootContainer)
    }
  }
}
