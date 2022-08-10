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
  const el = document.createElement(vnode.type)

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
