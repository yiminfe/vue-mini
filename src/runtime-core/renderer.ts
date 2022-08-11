/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { createAppAPI } from './createApp'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { effect } from '../reactivity/effect'

// 创建渲染器
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert
  } = options

  // 渲染
  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  // 比较虚拟节点 n1 : oldVnode n2 : newVnode
  function patch(n1, n2, container, parentComponent) {
    // TODO
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  // 处理 Fragment slot 节点
  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  // 处理 text 节点
  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  // 处理 element 节点
  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  // 比较 element diff
  function patchElement(n1, n2, container) {
    console.log('patchElement', container)
    console.log('n1', n1)
    console.log('n2', n2)
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
      patch(null, v, container, parentComponent)
    }
  }

  // 处理组件入口
  function processComponent(n1, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
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
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')

        // 获取组件实例的代理对象
        const { proxy } = instance

        // 调用渲染函数
        const subTree = (instance.subTree = instance.render.call(proxy))

        // 递归 比较 虚拟节点
        patch(null, subTree, container, instance)

        // 给虚拟节点的el赋值
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
