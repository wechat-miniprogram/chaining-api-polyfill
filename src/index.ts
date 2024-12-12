import 'miniprogram-api-typings'

export { ComponentWithPolyfill as Component } from './component'
export { BehaviorWithPolyfill as Behavior } from './behavior'

export const isMiniProgramEnvironment = () => {
  if (typeof wx !== 'undefined' && typeof wx.getSystemSetting !== 'undefined') {
    return true
  }
  return false
}
