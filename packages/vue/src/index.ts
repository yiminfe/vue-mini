/**
 * @file vue-mini 出口
 * @author zhaoyimin
 */
export * from '@vue-mini/runtime-dom'
import { baseCompile } from '@vue-mini/compiler-core'
import * as runtimeDom from '@vue-mini/runtime-dom'
import { registerRuntimeCompiler } from '@vue-mini/runtime-dom'

function compileToFunction(template) {
  const { code } = baseCompile(template)
  const render = new Function('Vue', code)(runtimeDom)
  return render
}

// 给runtime-dom模块注入编译function
registerRuntimeCompiler(compileToFunction)
