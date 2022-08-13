/**
 * @file 转换文本模块
 * @author zhaoyimin
 */

import { NodeTypes } from '../ast'
import { isText } from '../utils'

// 转换组合文本
export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node

      let currentContainer
      for (let i = 0; i < children.length; i++) {
        const child = children[i]

        // text and 插值
        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            // text and 插值
            if (isText(next)) {
              if (!currentContainer) {
                // 初始化容器，创建组合节点
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }

              currentContainer.children.push(' + ')
              currentContainer.children.push(next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              // 只跳出当前循环体
              break
            }
          }
        }
      }
    }
  }
}
