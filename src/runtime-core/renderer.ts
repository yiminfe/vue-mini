/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

// 渲染
export function render(vnode, container) {
  patch(vnode, container)
}

// 比较虚拟节点
function patch(vnode, container) {
  // TODO 判断vnode 是不是一个 element
  // 是 element 那么就应该处理 element
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

// 处理 element 节点
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

// 挂载 element
function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))

  const { children } = vnode

  // children
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  // props
  const { props } = vnode
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  container.append(el)
}

// 挂载 element 子节点
function mountChildren(vnode: any, container: any) {
  for (const v of vnode.children) {
    patch(v, container)
  }
}

// 处理组件入口
function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

// 挂载组件
function mountComponent(initialVNode: any, container) {
  // 创建组件实例
  const instance = createComponentInstance(initialVNode)

  // 组织组件数据
  setupComponent(instance)

  // 组织 渲染dom and 副作用函数effect
  setupRenderEffect(instance, initialVNode, container)
}

// 组织 渲染dom and 副作用函数effect
function setupRenderEffect(instance: any, initialVNode, container) {
  // 获取组件实例的代理对象
  const { proxy } = instance

  // 调用渲染函数
  const subTree = instance.render.call(proxy)

  // 递归 比较 虚拟节点
  patch(subTree, container)

  // 给虚拟节点的el赋值
  initialVNode.el = subTree.el
}
