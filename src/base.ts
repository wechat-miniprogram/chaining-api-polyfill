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
type IAnyObject = WechatMiniprogram.IAnyObject

type Lifetimes = {
  created: () => void
  attached: () => void
  moved: () => void
  detached: () => void
  ready: () => void
}

type PageLifetimes = {
  show: () => void
  hide: () => void
  resize: (size: { width: number; height: number }) => void
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

type ObserverFunction = (...args: any[]) => void

export type TaggedMethod<Fn extends ComponentMethod> = typeUtils.TaggedMethod<Fn>

export type UnTaggedMethod<M extends TaggedMethod<any>> = typeUtils.UnTaggedMethod<M>

export const METHOD_TAG = Symbol('method')

const tagMethod = <Fn extends ComponentMethod>(func: Fn): TaggedMethod<Fn> => {
  const taggedMethod = func as unknown as TaggedMethod<Fn>
  ;(taggedMethod as unknown as { [tag: symbol]: true })[METHOD_TAG] = true
  return taggedMethod
}

const isTaggedMethod = (func: unknown): func is TaggedMethod<ComponentMethod> => {
  return typeof func === 'function' && !!(func as unknown as { [tag: symbol]: true })[METHOD_TAG]
}

type ChainingPolyfillInitData = {
  lifetimes: { [key: string]: ObserverFunction[] }
  pageLifetimes: { [key: string]: ObserverFunction[] }
  observers: { [key: string]: ObserverFunction[] }
  initFuncs: ObserverFunction[]
}

class ChainingPolyfillMetadata {
  traitGroup = new TraitGroup()
  lifetimes: { [key: string]: ObserverFunction[] }
  pageLifetimes: { [key: string]: ObserverFunction[] }
  observers: { [key: string]: ObserverFunction[] }

  constructor(init: ChainingPolyfillInitData) {
    this.lifetimes = init.lifetimes
    this.pageLifetimes = init.pageLifetimes
    this.observers = init.observers
  }

  generateBuilderContext(self: GeneralComponent): BuilderContext<any, any, any> {
    return {
      self,
      data: self.data,
      setData: self.setData.bind(self),
      implement: (trait_behavior: TraitBehavior<any, any>, impl: any) => {
        this.traitGroup.implement(trait_behavior, impl)
      },
      observer: () => {
        // TODO
      },
      lifetime: (name: string, func: () => void) => {
        if (!this.lifetimes[name]) this.lifetimes[name] = []
        this.lifetimes[name].push(func)
      },
      pageLifetime: (name: string, func: () => void) => {
        if (!this.pageLifetimes[name]) this.pageLifetimes[name] = []
        this.pageLifetimes[name].push(func)
      },
      method: tagMethod,
      listener: tagMethod,
    }
  }

  handleBuilderContextExport(comp: GeneralComponent, exported: unknown) {
    if (typeof exported === 'object' && exported !== null) {
      const exportedKeys = Object.keys(exported)
      for (let j = 0; j < exportedKeys.length; j += 1) {
        const exportedKey = exportedKeys[j]!
        const exportItem = (exported as { [k in string]: unknown })[exportedKey]
        if (isTaggedMethod(exportItem)) {
          comp.methods[exportedKey] = exportItem
        }
      }
    }
  }
}

const getChainingPolyfillMetadata = (comp: GeneralComponent): ChainingPolyfillMetadata => {
  return comp._$chainingPolyfill
}

const chainingPolyfillBehavior = Behavior({
  created() {
    const self = this as any
    if (self.data._$chainingPolyfillMetadata) {
      const initData = self.data._$chainingPolyfillMetadata as ChainingPolyfillInitData
      self.data._$chainingPolyfillMetadata = null
      const chainingPolyfillMetadata = new ChainingPolyfillMetadata(initData)
      self._$chainingPolyfill = chainingPolyfillMetadata
      const ctx = chainingPolyfillMetadata.generateBuilderContext(self)
      initData.initFuncs.forEach((f) => {
        const exported = f(ctx)
        chainingPolyfillMetadata.handleBuilderContextExport(self, exported)
      })
    }
    const created = getChainingPolyfillMetadata(self).lifetimes.created ?? []
    for (let i = 0; i < created.length; i += 1) {
      created[i].call(self)
    }
  },
  // TODO
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
  protected _$definition = {
    data: {
      _$chainingPolyfillMetadata: {
        lifetimes: {},
        observers: {},
      } as ChainingPolyfillInitData,
    } as DataList,
    properties: {} as typeUtils.PropertyListItem<any, any>,
    methods: {} as MethodList,
    behaviors: [chainingPolyfillBehavior],
    lifetimes: {} as { [key: string]: ObserverFunction },
    pageLifetimes: {} as { [key: string]: ObserverFunction },
    observers: [] as { fields: string; observer: ObserverFunction }[],
    externalClasses: [] as string[],
    export: undefined as undefined | (() => TComponentExport),
  }

  protected _$getChainingPolyfillInitData(): ChainingPolyfillInitData {
    return this._$definition.data.chainingPolyfillMetadata
  }

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

  staticData<T extends DataList>(
    data: typeUtils.NewFieldList<AllData<TData, TProperty>, T>,
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
    Object.assign(this._$definition.data, data)
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
  ): ResolveBehaviorBuilder<this, TChainingFilter>
  observer(
    paths: string | readonly string[],
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, ...args: any[]) => any,
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    const fields = typeof paths === 'string' ? paths : paths.join(', ')
    this._$definition.observers.push({ fields, observer: func })
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
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    const lifetimes = this._$getChainingPolyfillInitData().lifetimes
    if (!lifetimes[name]) {
      lifetimes[name] = []
    }
    lifetimes[name].push(func)
    return this as any
  }

  /**
   * Add a page-lifetime callback
   */
  pageLifetime<L extends keyof PageLifetimes>(
    name: L,
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      ...args: Parameters<PageLifetimes[L]>
    ) => any,
  ): ResolveBehaviorBuilder<this, TChainingFilter> {
    const pageLifetimes = this._$getChainingPolyfillInitData().pageLifetimes
    if (!pageLifetimes[name]) {
      pageLifetimes[name] = []
    }
    pageLifetimes[name].push(func)
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
    this._$getChainingPolyfillInitData().initFuncs.push(func)
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

export interface BuilderContext<
  TPrevData extends DataList,
  TProperty extends PropertyList,
  TMethodCaller,
> extends ThisType<TMethodCaller> {
  self: TMethodCaller
  data: AllData<TPrevData, TProperty>
  setData: (
    this: void,
    newData: Partial<typeUtils.SetDataSetter<TPrevData>>,
    callback?: () => void,
  ) => void
  implement: <TIn extends { [x: string]: any }>(
    this: void,
    traitBehavior: TraitBehavior<TIn, any>,
    impl: TIn,
  ) => void
  observer<
    P extends typeUtils.ObserverDataPathStrings<AllData<TPrevData, TProperty>>,
    V = typeUtils.GetFromObserverPathString<AllData<TPrevData, TProperty>, P>,
  >(
    this: void,
    paths: P,
    func: (newValue: V) => void,
  ): void
  observer<
    P extends typeUtils.ObserverDataPathStrings<AllData<TPrevData, TProperty>>[],
    V = {
      [K in keyof P]: typeUtils.GetFromObserverPathString<AllData<TPrevData, TProperty>, P[K]>
    },
  >(
    this: void,
    paths: readonly [...P],
    func: (...newValues: V extends any[] ? V : never) => void,
  ): void
  lifetime: <L extends keyof Lifetimes>(this: void, name: L, func: Lifetimes[L]) => void
  pageLifetime: (this: void, name: string, func: (...args: any[]) => void) => void
  method: <Fn extends ComponentMethod>(this: void, func: Fn) => TaggedMethod<Fn>
  listener: <TDetail extends IAnyObject>(
    this: void,
    func: EventListener<TDetail>,
  ) => TaggedMethod<EventListener<TDetail>>
}

type EventListener<TDetail extends IAnyObject> = (ev: Event<TDetail>) => boolean | void

type Event<TDetail extends IAnyObject> = WechatMiniprogram.CustomEvent<TDetail, any, any, any>
