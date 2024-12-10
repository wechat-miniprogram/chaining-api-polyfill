export type GeneralFuncType = (this: any, ...args: any[]) => any

export class FuncArr<F extends GeneralFuncType> {
  empty = true
  private _$arr: F[] | null = null

  add(func: F) {
    if (!this._$arr) this._$arr = [func]
    else this._$arr = this._$arr.concat(func)
    this.empty = false
  }

  clone(): FuncArr<F> {
    const ret = new FuncArr<F>()
    ret.empty = this.empty
    ret._$arr = this._$arr
    return ret
  }

  call(caller: ThisParameterType<F>, args: Parameters<F>): boolean {
    const arr = this._$arr
    let ret = true
    if (arr) {
      for (let i = 0; i < arr.length; i += 1) {
        const r = safeCallback<F>(arr[i]!, caller, args)
        if (r === false) ret = false
      }
    }
    return ret
  }
}

export function safeCallback<F extends GeneralFuncType>(
  this: void,
  method: F,
  caller: ThisParameterType<F>,
  args: Parameters<F>,
): ReturnType<F> | undefined {
  try {
    return method.apply(caller, args)
  } catch (e) {
    console.error(e)
    return undefined
  }
}
