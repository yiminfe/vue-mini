/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { createComponentInstance, setupComponent } from './component'

// 旋绕
export function render(vnode, container) {
  patch(vnode, container)
}

// 比较虚拟节点
function patch(vnode, container) {
  // TODO 判断vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  // 思考题： 如何去区分是 element 还是 component 类型呢？
  // processElement();

  processComponent(vnode, container)
}

// 处理组件入口
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

// 挂载组件
function mountComponent(vnode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(vnode)

  // 组织组件
  setupComponent(instance)

  // 组织 渲染dom and 副作用函数effect
  setupRenderEffect(instance, container)
}

// 组织 渲染dom and 副作用函数effect
function setupRenderEffect(instance: any, container) {
  // 获取旋绕函数
  const subTree = instance.render()

  // 递归 比较 虚拟节点
  patch(subTree, container)
}
