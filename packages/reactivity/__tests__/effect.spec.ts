import { reactive } from '../src/reactive'
import { effect, stop, start } from '../src/effect'

describe('Test Reactivity Effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })

    expect(nextAge).toBe(11)

    // update
    user.age++
    expect(nextAge).toBe(12)
  })

  it('should return runner when call effect', () => {
    let foo = 0
    const runner = effect(() => {
      foo++
      return foo
    })
    expect(foo).toBe(1)
    runner()
    expect(foo).toBe(2)
    expect(runner()).toBe(3)

    const runnerString = effect(() => {
      foo++
      return 'foo'
    })
    expect(runnerString()).toBe('foo')
  })

  it('scheduler', () => {
    let dummy
    // TODO 遇到的问题1：ts中声明了类型的变量，没有赋值，vscode会报错
    let run: (() => void) | undefined
    const scheduler = jest.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    // scheduler 被调用的次数
    expect(scheduler).toHaveBeenCalledTimes(1)
    // // should not run yet
    expect(dummy).toBe(1)
    // // manually run
    run && run()
    // // should have run
    expect(dummy).toBe(2)
  })

  it('stop and start', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner)
    stop(runner)
    obj.prop = 3
    // TODO 遇到的问题 ++ stop失效
    obj.prop++
    runner()
    expect(dummy).toBe(4)

    // stopped effect should still be manually callable
    start(runner)
    start(runner)
    runner()
    obj.prop++
    expect(obj.prop).toBe(5)
    expect(dummy).toBe(5)
  })

  it('onStop', () => {
    const obj = reactive({
      foo: 1
    })
    const onStop = jest.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop
      }
    )

    stop(runner)
    expect(onStop).toBeCalledTimes(1)
    expect(dummy).toBe(1)
  })
})
