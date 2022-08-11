/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { createAppAPI } from './createApp'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

// 创建渲染器
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options

  // 渲染
  function render(vnode, container) {
    patch(vnode, container, null)
  }

  // 比较虚拟节点
  function patch(vnode, container, parentComponent) {
    // TODO
    const { type, shapeFlag } = vnode
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentComponent)
        }
        break
    }
  }

  // 处理 Fragment slot 节点
  function processFragment(vnode: any, container: any, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }

  // 处理 text 节点
  function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  // 处理 element 节点
  function processElement(vnode: any, container: any, parentComponent) {
    mountElement(vnode, container, parentComponent)
  }

  // 挂载 element
  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type))

    const { children, shapeFlag } = vnode

    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }

    // 处理属性
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, val)
    }

    // 挂载到容器
    hostInsert(el, container)
  }

  // 挂载 element 子节点
  function mountChildren(vnode: any, container: any, parentComponent) {
    for (const v of vnode.children) {
      patch(v, container, parentComponent)
    }
  }

  // 处理组件入口
  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  // 挂载组件
  function mountComponent(initialVNode: any, container, parentComponent) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent)

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
    patch(subTree, container, instance)

    // 给虚拟节点的el赋值
    initialVNode.el = subTree.el
  }

  return {
    createApp: createAppAPI(render)
  }
}
