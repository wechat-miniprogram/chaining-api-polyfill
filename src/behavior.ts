import 'miniprogram-api-typings'
import { TraitBehavior } from './trait_behavior'
import { BaseBehaviorBuilder } from './base'

declare const Behavior: WechatMiniprogram.Behavior.Constructor

export interface IBehaviorWithPolyfill {
  (): BehaviorBuilder
  <
    TData extends WechatMiniprogram.Behavior.DataOption,
    TProperty extends WechatMiniprogram.Behavior.PropertyOption,
    TMethod extends WechatMiniprogram.Behavior.MethodOption,
    TBehavior extends WechatMiniprogram.Behavior.BehaviorOption,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TCustomInstanceProperty extends WechatMiniprogram.IAnyObject = {},
  >(
    options: WechatMiniprogram.Behavior.Options<
      TData,
      TProperty,
      TMethod,
      TBehavior,
      TCustomInstanceProperty
    >,
  ): string
  trait<TIn extends { [key: string]: any }>(): TraitBehavior<TIn, TIn>
  trait<TIn extends { [key: string]: any }, TOut extends { [key: string]: any }>(
    trans: (impl: TIn) => TOut,
  ): TraitBehavior<TIn, TOut>
}

export const BehaviorWithPolyfill = ((options: any) => {
  if (typeof options === 'undefined') {
    return new BehaviorBuilder()
  }
  return Behavior(options)
}) as IBehaviorWithPolyfill

BehaviorWithPolyfill.trait = (trans?: any) => {
  return new TraitBehavior(trans)
}

export class BehaviorBuilder extends BaseBehaviorBuilder {
  // TODO
}
