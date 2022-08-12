/**
 * @file 渲染器 模块
 * @author zhaoyimin
 */
import { createAppAPI } from './createApp'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ } from '../shared'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { Fragment, Text } from './vnode'
import { effect } from '../reactivity/effect'

// 获取最长递增子序列
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        // 右移，最高位补0
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

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
      // 中间乱序 对比
      const s1 = i
      const s2 = i

      // 新节点剩下的总数
      const toBePatched = e2 - s2 + 1
      // 记录比较次数
      let patched = 0

      // 根据属性 key 建立 Map映射表  记录key在新节点对应的下标
      const keyToNewIndexMap = new Map()

      // 根据新节点剩下的总数，创建新节点映射旧节点的下标容器（newVnode.index->oldVnode.index），value=旧节点的下标
      const newIndexToOldIndexMap = new Array(toBePatched)
      // 是否需要移动元素
      let moved = false
      // 查找到的新节点index是否是持续的
      let maxNewIndexSoFar = 0
      // 给新节点映射旧节点的下标容器赋初始值 0代表在旧节点中不存在
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      // 给新节点 key映射表 赋值 value = 新节点的下标
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      // 遍历 旧节点
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i]

        // 新节点已经比较完了，剩余的旧节点直接删除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el, container)
          continue
        }

        // 记录 新节点key对应的下标
        let newIndex
        if (prevChild.key != null) {
          // 时间复杂度O(n) 在新节点key->index映射表中查找新节点的index
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // 当旧节点的key不存在， 时间复杂度O(n²)，比较vnode.type
          // TODO 遇到的问题 j <= e2 索引值应该相等
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        // 在新节点中没有找到，直接删除
        if (newIndex === undefined) {
          hostRemove(prevChild.el, container)
        } else {
          // 找到了
          if (newIndex >= maxNewIndexSoFar) {
            // newIndex 是持续的，不需要移动元素
            maxNewIndexSoFar = newIndex
          } else {
            // newIndex 不是持续的，需要移动元素
            moved = true
          }

          // 给newVnode.index->oldVnode.index映射容器赋值，i+1 避免0代表在旧节点中不存在的场景
          newIndexToOldIndexMap[newIndex - s2] = i + 1

          // 继续 diff
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      // 根据最长递增子序列处理移动
      // 性能优化，需要移动，才获取最长递增子序列
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      // 获取 最长递增子序列 的最大下标
      let j = increasingNewIndexSequence.length - 1

      // 新节点数组反转 进行移动，保证nextIndex + 1的元素已经存在dom树上
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 获取需要移动的元素下标
        const nextIndex = i + s2
        // 获取需要移动的元素
        const nextChild = c2[nextIndex]
        // 获取锚点元素
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        // newVnode.index->oldVnode.index映射表的值=0 说明新节点在旧节点中不存，需要新增元素
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          // 需要移动的元素
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
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
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  // diff 组件
  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  // 挂载组件
  function mountComponent(
    initialVNode: any,
    container,
    parentComponent,
    anchor
  ) {
    // 创建组件实例
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))

    // 组织组件数据 props emits slots proxy 等
    setupComponent(instance)

    // 组织 渲染dom and 副作用函数effect
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  // 组织 渲染dom and 副作用函数effect
  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    instance.update = effect(() => {
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
        const { next, vnode } = instance
        if (next) {
          next.el = vnode.el
          updateComponentPreRender(instance, next)
        }

        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree
        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)
      }
    })
  }

  function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode
    instance.next = null
    instance.props = nextVNode.props
  }

  return {
    createApp: createAppAPI(render)
  }
}
