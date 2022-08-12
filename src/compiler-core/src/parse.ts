import { NodeTypes } from './ast'

const enum TagType {
  Start,
  End
}

// 基础词法解析
export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

// 解析children
function parseChildren(context, ancestors) {
  const nodes: any = []

  let node
  while (!isEnd(context, ancestors)) {
    const s = context.source
    if (s.startsWith('{{')) {
      // 判断是否是插值标识开头
      node = parseInterpolation(context)
    } else if (s[0] === '<' && /[a-z]/i.test(s[1])) {
      // 判断是否是element
      node = parseElement(context, ancestors)
    }

    if (!node) {
      // 解析文本
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

// 判断是否结束
function isEnd(context, ancestors) {
  const s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      // 判断结束标签是否一致
      if (startsWithEndTagOpen(s, tag)) {
        return true
      }
    }
  }
  return !s
}

// 判断结束标签是否一致
function startsWithEndTagOpen(source, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
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
  const rawContent = parseTextData(context, rawContentLength)
  // 去掉空格
  const content = rawContent.trim()

  // 往后推进词法
  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

// 解析element
function parseElement(context: any, ancestors) {
  // 解析tag节点
  const element: any = parseTag(context, TagType.Start)
  // 入栈
  ancestors.push(element)
  // 解析children
  element.children = parseChildren(context, ancestors)
  // 出栈
  ancestors.pop()
  // 判断结束标签是否一致
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签:${element.tag}`)
  }
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

// 解析 文本
function parseText(context: any) {
  // 1. 获取content
  let endIndex = context.source.length
  const endTokens = ['<', '{{']

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    // endIndex > index 找到最近的结束 token index
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

// 解析 文本 数据 && 推进
function parseTextData(context: any, length) {
  const content = context.source.slice(0, length)

  // 2. 推进
  advanceBy(context, length)
  return content
}

// 词法推进
function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

// 创建根节点
function createRoot(children) {
  return {
    children,
    type: NodeTypes.ROOT
  }
}

// 创建解析上下文
function createParserContext(content: string): any {
  return {
    source: content
  }
}
