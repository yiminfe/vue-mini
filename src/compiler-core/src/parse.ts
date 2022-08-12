import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

// 基础词法解析
export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

// 解析children
function parseChildren(context) {
  const nodes: any = []

  let node
  const s = context.source
  if (s.startsWith('{{')) {
    // 判断是否是插值标识开头
    node = parseInterpolation(context)
  } else if (s[0] === '<') {
    // 判断是否是element
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
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

// 解析element
function parseElement(context: any) {
  const element = parseTag(context, TagType.Start)

  parseTag(context, TagType.End)

  return element
}

// 解析element tag节点
function parseTag(context: any, type: TagType) {
  // <div></div>
  // TODO 正则校验网站：https://regexr.com/
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  advanceBy(context, match[0].length + 1)
  // advanceBy(context, 1)

  if (type === TagType.End) return

  const tag = match[1]
  return {
    type: NodeTypes.ELEMENT,
    tag
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
