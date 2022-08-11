/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

// 渲染
export function render(vnode, container) {
  patch(vnode, container)
}

// 比较虚拟节点
function patch(vnode, container) {
  // TODO
  const { type, shapeFlag } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break

    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
      }
      break
  }
}

// 处理 Fragment slot 节点
function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container)
}

// 处理 text 节点
function processText(vnode: any, container: any) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

// 处理 element 节点
function processElement(vnode: any, container: any) {
  mountElement(vnode, container)
}

// 挂载 element
function mountElement(vnode: any, container: any) {
  const el = (vnode.el = document.createElement(vnode.type))

  const { children, shapeFlag } = vnode

  // 处理子节点
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el)
  }

  // 处理属性
  const { props } = vnode
  for (const key in props) {
    const val = props[key]
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  // 挂载到容器
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

  // 组织组件数据 props emits slots proxy 等
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
