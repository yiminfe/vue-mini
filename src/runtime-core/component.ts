/**
 * @file 创建组件 模块
 * @author zhaoyimin
 */

// 创建组件实例
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

// 组织组件结构
export function setupComponent(instance) {
  // TODO
  // 初始化 props
  // initProps()

  // 初始化 slot
  // initSlots()

  // 组织有状态的组件
  setupStatefulComponent(instance)
}

// 组织有状态的组件
function setupStatefulComponent(instance: any) {
  // 获取
  const Component = instance.type

  // 获取组件的setup函数
  const { setup } = Component

  if (setup) {
    const setupResult = setup()

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
