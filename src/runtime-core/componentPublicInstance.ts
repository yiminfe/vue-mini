/**
 * @file 组件公开实例属性 模块
 * @author zhaoyimin
 */

// 适配器模式
const publicPropertiesMap = {
  $el: (i) => i.vnode.el
}

// 处理公开实例属性
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // setupState 响应式数据
    const { setupState } = instance
    if (key in setupState) {
      return setupState[key]
    }

    // 公开实例属性
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
