import { BaseBehaviorBuilder } from './base'

declare const Component: WechatMiniprogram.Component.Constructor

export interface IComponentWithPolyfill {
  (): ComponentBuilder
  <
    TData extends WechatMiniprogram.Component.DataOption,
    TProperty extends WechatMiniprogram.Component.PropertyOption,
    TMethod extends WechatMiniprogram.Component.MethodOption,
    TBehavior extends WechatMiniprogram.Component.BehaviorOption,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TCustomInstanceProperty extends WechatMiniprogram.IAnyObject = {},
    TIsPage extends boolean = false,
  >(
    options: WechatMiniprogram.Component.Options<
      TData,
      TProperty,
      TMethod,
      TBehavior,
      TCustomInstanceProperty,
      TIsPage
    >,
  ): string
}

export const ComponentWithPolyfill = ((options?: any) => {
  if (typeof options === 'undefined') {
    return new ComponentBuilder()
  }
  return Component(options)
}) as IComponentWithPolyfill

export class ComponentBuilder extends BaseBehaviorBuilder {
  // TODO
}
