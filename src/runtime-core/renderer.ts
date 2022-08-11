/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { createAppAPI } from './createApp'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ } from '../shared'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'
import { effect } from '../reactivity/effect'

// 创建渲染器
export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

  // 渲染
  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  // 比较虚拟节点 n1 : oldVnode n2 : newVnode
  function patch(n1, n2, container, parentComponent, anchor) {
    // TODO
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container, anchor)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  // 处理 Fragment slot 节点
  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  // 处理 text 节点
  function processText(n1, n2: any, container: any, anchor) {
    const { children } = n2
    const textNode = (n2.el = hostCreateText(children))
    hostInsert(textNode, container, anchor)
  }

  // 处理 element 节点
  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  // 比较 element diff
  function patchElement(n1, n2, container, parentComponent, anchor) {
    console.log('patchElement', container)
    console.log('n1', n1)
    console.log('n2', n2)

    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  // 比较 children
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const c1 = n1.children
    const { shapeFlag } = n2
    const c2 = n2.children

    // newNode->Text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // oldNode->Array
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1, container)
      }
      // oldNode->Array | Text
      if (c1 !== c2) {
        hostSetElementText(container, c2)
      }
    } else {
      // newNode->Array oldNode->Text
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1

    // 是否相同的节点
    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧有序 diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      i++
    }

    // 右侧有序 diff
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }

      e1--
      e2--
    }

    // 有序场景1：新节点比旧节点多
    if (i > e1) {
      if (i <= e2) {
        // 锚点索引
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 有序场景2：新节点比旧节点少
      while (i <= e1) {
        hostRemove(c1[i].el, container)
        i++
      }
    } else {
      // 乱序diff
    }
  }

  // 卸载 children
  function unmountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el, container)
    }
  }

  // 比较 props
  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 挂载 element
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))

    const { children, shapeFlag } = vnode

    // 处理子节点
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }

    // 处理属性
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    // 挂载到容器
    hostInsert(el, container, anchor)
  }

  // 挂载 element 子节点
  function mountChildren(children, container: any, parentComponent, anchor) {
    for (const v of children) {
      patch(null, v, container, parentComponent, anchor)
    }
  }

  // 处理组件入口
  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  // 挂载组件
  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    // 创建组件实例
    const instance = createComponentInstance(initialVNode, parentComponent)

    // 组织组件数据 props emits slots proxy 等
    setupComponent(instance)

    // 组织 渲染dom and 副作用函数effect
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  // 组织 渲染dom and 副作用函数effect
  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')

        // 获取组件实例的代理对象
        const { proxy } = instance

        // 调用渲染函数
        const subTree = (instance.subTree = instance.render.call(proxy))

        // 递归 比较 虚拟节点
        patch(null, subTree, container, instance, anchor)

        // 给虚拟节点的el赋值
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        console.log('update')
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
