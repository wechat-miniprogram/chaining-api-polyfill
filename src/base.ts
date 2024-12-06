import { type typeUtils } from 'glass-easel'
import { TraitBehavior, TraitGroup } from './trait_behavior'

export type Empty = typeUtils.Empty
export type DataList = WechatMiniprogram.Behavior.DataOption
export type PropertyList = WechatMiniprogram.Behavior.PropertyOption
export type MethodList = WechatMiniprogram.Behavior.MethodOption
export type ChainingFilterType = typeUtils.ChainingFilterType
export type AllData<TData extends DataList, TProperty extends PropertyList> = TData &
  WechatMiniprogram.Component.PropertyOptionToData<TProperty>
export type PropertyType = typeUtils.PropertyType
export type PropertyTypeToValueType<T extends PropertyType> = typeUtils.PropertyTypeToValueType<T>
export type ComponentMethod = typeUtils.ComponentMethod
export type TaggedMethod<Fn extends ComponentMethod> = typeUtils.TaggedMethod<Fn>
export type UnTaggedMethod<M extends TaggedMethod<any>> = typeUtils.UnTaggedMethod<M>

type Lifetimes = {
  created: () => void
  attached: () => void
  moved: () => void
  detached: () => void
  ready: () => void
}

export type GeneralComponent = Component<any, any, any, any>

export type Component<
  TData extends DataList,
  TProperty extends PropertyList,
  TMethod extends MethodList,
  TExtraThisFields extends DataList = Empty,
> = WechatMiniprogram.Component.Instance<TData, TProperty, TMethod, []> & TExtraThisFields

export type ResolveBehaviorBuilder<B, TChainingFilter extends ChainingFilterType> =
  typeUtils.IsNever<TChainingFilter> extends false
    ? TChainingFilter extends ChainingFilterType
      ? Omit<B, TChainingFilter['remove']> & TChainingFilter['add']
      : B
    : B

class ChainingPolyfillMetadata {
  traitGroup = new TraitGroup()
}

const getChainingPolyfillMetadata = (comp: GeneralComponent) => {
  return comp._$chainingPolyfill
}

const chainingPolyfillBehavior = Behavior({
  created() {
    const self = this as any
    if (!self._$chainingPolyfill) {
      self._$chainingPolyfill = new ChainingPolyfillMetadata()
    }
  },
})

export class BaseBehaviorBuilder<
  TPrevData extends DataList = Empty,
  TData extends DataList = Empty,
  TProperty extends PropertyList = Empty,
  TMethod extends MethodList = Empty,
  TChainingFilter extends ChainingFilterType = never,
  TPendingChainingFilter extends ChainingFilterType = never,
  TComponentExport = never,
  TExtraThisFields extends DataList = Empty,
> {
  protected _$definition: WechatMiniprogram.Component.Options<any, any, any, any> = {
    properties: {},
    behaviors: [chainingPolyfillBehavior],
  }
  private _$export: (() => any) | null = null

  /** Add external classes */
  externalClasses(list: string[]): this {
    const def = this._$definition
    if (def.externalClasses) def.externalClasses = def.externalClasses.concat(list)
    else def.externalClasses = list
    return this
  }

  /** Set the export value when the component is being selected */
  export<TNewComponentExport>(
    f: () => TNewComponentExport,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TNewComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    if (!this._$definition.export) this._$definition.behaviors.unshift('wx://component-export')
    this._$definition.export = f as any
    return this as any
  }

  data<T extends DataList>(
    gen: typeUtils.NewFieldList<AllData<TData, TProperty>, T>,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      T,
      TData & T,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    this._$definition.data(gen)
    return this as any
  }

  property<N extends string, T extends PropertyType, V extends PropertyTypeToValueType<T>>(
    name: N,
    def: N extends keyof (TData & TProperty) ? never : typeUtils.PropertyListItem<T, V>,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData,
      TProperty & Record<N, unknown extends V ? T : typeUtils.PropertyOption<T, V>>,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    this._$definition.properties[name] = def
    return this as any
  }

  /**
   * Add some public methods
   *
   * The public method can be used as an event handler, and can be visited in component instance.
   */
  methods<T extends MethodList>(
    funcs: T & ThisType<Component<TData, TProperty, TMethod, TExtraThisFields>>,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod & T,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    Object.assign(this._$definition.methods, funcs)
    return this as any
  }

  /**
   * Add a data observer
   */
  observer<
    P extends typeUtils.ObserverDataPathStrings<AllData<TPrevData, TProperty>>,
    V = typeUtils.GetFromObserverPathString<AllData<TPrevData, TProperty>, P>,
  >(
    paths: P,
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, newValue: V) => void,
    once?: boolean,
  ): ResolveBehaviorBuilder<this, TChainingFilter>
  observer<
    P extends typeUtils.ObserverDataPathStrings<AllData<TPrevData, TProperty>>[],
    V = {
      [K in keyof P]: typeUtils.GetFromObserverPathString<AllData<TPrevData, TProperty>, P[K]>
    },
  >(
    paths: readonly [...P],
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      ...newValues: V extends any[] ? V : never
    ) => void,
    once?: boolean,
  ): ResolveBehaviorBuilder<this, TChainingFilter>
  observer(
    paths: string | readonly string[],
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, ...args: any[]) => any,
    once = false,
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    // TODO
    return this as any
  }

  /**
   * Add a lifetime callback
   */
  lifetime<L extends keyof Lifetimes>(
    name: L,
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      ...args: Parameters<Lifetimes[L]>
    ) => ReturnType<Lifetimes[L]>,
    once = false,
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    // TODO
    return this as any
  }

  /**
   * Add a page-lifetime callback
   */
  pageLifetime(
    name: string,
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, ...args: any[]) => any,
    once = false,
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    // TODO
    return this as any
  }

  init<TExport extends Record<string, TaggedMethod<(...args: any[]) => any>> | void>(
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      builderContext: BuilderContext<
        TPrevData,
        TProperty,
        Component<TData, TProperty, TMethod, TExtraThisFields>
      >,
    ) => TExport,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod &
        (TExport extends void
          ? Empty
          : {
              [K in keyof TExport]: UnTaggedMethod<TExport[K]>
            }),
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    // TODO
    return this as any
  }

  definition<
    TNewData extends DataList = Empty,
    TNewProperty extends PropertyList = Empty,
    TNewMethod extends MethodList = Empty,
    TNewComponentExport = never,
  >(
    definition: WechatMiniprogram.Component.Options<TNewData, TNewProperty, TNewMethod, any> &
      ThisType<
        Component<
          TData & TNewData,
          TProperty & TNewProperty,
          TMethod & TNewMethod,
          TExtraThisFields
        >
      >,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData & TNewData,
      TProperty & TNewProperty,
      TMethod & TNewMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TNewComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    // TODO
    return this as any
  }
}
