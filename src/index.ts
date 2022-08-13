/**
 * @file vue-mini 出口
 * @author zhaoyimin
 */
export * from './runtime-dom'
import { baseCompile } from './compiler-core'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'

function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

// 给runtime-dom模块注入编译function
registerRuntimeCompiler(compileToFunction)
