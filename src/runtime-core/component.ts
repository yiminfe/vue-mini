/**
 * @file 创建组件数据 模块
 * @author zhaoyimin
 */
import { shallowReadonly } from '../reactivity/reactive'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initProps } from './componentProps'
import { emit } from './componentEmit'

// 创建组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => undefined
  }

  component.emit = emit.bind(null, component) as any

  return component
}

// 组织组件结构
export function setupComponent(instance) {
  // TODO
  // 初始化 props
  initProps(instance, instance.vnode.props)

  // 初始化 slot
  // initSlots()

  // 组织有状态的组件
  setupStatefulComponent(instance)
}

// 组织有状态的组件
function setupStatefulComponent(instance: any) {
  // 获取
  const Component = instance.type

  // 给组件实例创建代理对象
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  // 获取组件的setup函数
  const { setup } = Component

  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })

    // 处理setup函数的返回值
    handleSetupResult(instance, setupResult)
  }
}

// 处理setup函数的返回值
function handleSetupResult(instance, setupResult: any) {
  // function Object
  // TODO function
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  // 处理完组件的setup函数
  finishComponentSetup(instance)
}

// 处理完组件的setup函数
function finishComponentSetup(instance: any) {
  const Component = instance.type

  instance.render = Component.render
}
