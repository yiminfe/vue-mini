/**
 * @file 初始化组件的slots
 * @author zhaoyimin
 */
import { ShapeFlags } from '../shared/ShapeFlags'

// 初始化 slots
export function initSlots(instance, children) {
  // slots
  const { vnode } = instance
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

// 处理slots object
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

// 处理 slots value
function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
