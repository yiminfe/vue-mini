import { NodeTypes } from './ast'

// 基础词法解析
export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

// 解析children
function parseChildren(context) {
  const nodes: any = []

  let node
  // 判断是否是插值标识开头
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context)
  }

  nodes.push(node)

  return nodes
}

// 解析插值
function parseInterpolation(context) {
  // {{message}}

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  // 获取插值标识的结束标识的位置
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  // 往后推进词法
  advanceBy(context, openDelimiter.length)

  // 插值内容长度 包含空格
  const rawContentLength = closeIndex - openDelimiter.length

  // 获取插值内容
  const rawContent = context.source.slice(0, rawContentLength)
  // 去掉空格
  const content = rawContent.trim()

  // 往后推进词法
  advanceBy(context, rawContentLength + closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

// 词法推进
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

// 创建根节点
function createRoot(children) {
  return {
    children
  }
}

// 创建解析上下文
function createParserContext(content: string): any {
  return {
    source: content
  }
}
