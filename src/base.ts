import { GeneralFuncType, FuncArr } from './func_arr'
import { TraitBehavior, TraitGroup } from './trait_behavior'
import {
  GetFromObserverPathString,
  METHOD_TAG,
  ObserverDataPathStrings,
  SetDataSetter,
  TaggedMethod,
  UnTaggedMethod,
} from './type_utils'

export type Empty = Record<never, never>
export type DataList = WechatMiniprogram.Behavior.DataOption
export type PropertyList = WechatMiniprogram.Behavior.PropertyOption
export type MethodList = WechatMiniprogram.Behavior.MethodOption
export type ChainingFilterType = {
  add: { [key: string]: any }
  remove: string
}
export type AllData<TData extends DataList, TProperty extends PropertyList> = TData &
  WechatMiniprogram.Component.PropertyOptionToData<TProperty>
export type PropertyType = WechatMiniprogram.Component.AllProperty
export type PropertyToData<T extends PropertyType> = WechatMiniprogram.Component.PropertyToData<T>
type IAnyObject = WechatMiniprogram.IAnyObject

export type NewFieldList<TObject, TNewObject> =
  Extract<keyof TObject, keyof TNewObject> extends never ? TNewObject : never

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
  resize: (size: WechatMiniprogram.Page.IResizeOption) => void
}

export type GeneralComponent = Component<any, any, any, any>

export type Component<
  TData extends DataList,
  TProperty extends PropertyList,
  TMethod extends MethodList,
  TExtraThisFields extends DataList = Empty,
> = WechatMiniprogram.Component.Instance<TData, TProperty, TMethod, [], Empty> &
  TExtraThisFields & {
    traitBehavior: <TOut extends { [x: string]: any }>(
      traitBehavior: TraitBehavior<any, TOut>,
    ) => TOut | undefined
  }

export type ComponentMethod = (...any: []) => void

export type ResolveBehaviorBuilder<B> = B

const tagMethod = <Fn extends ComponentMethod>(func: Fn): TaggedMethod<Fn> => {
  const taggedMethod = func as unknown as TaggedMethod<Fn>
  ;(taggedMethod as unknown as { [tag: symbol]: true })[METHOD_TAG] = true
  return taggedMethod
}

const isTaggedMethod = (func: unknown): func is TaggedMethod<ComponentMethod> => {
  return typeof func === 'function' && !!(func as unknown as { [tag: symbol]: true })[METHOD_TAG]
}

type ChainingPolyfillInitData = {
  lifetimes: { [key: string]: FuncArr<GeneralFuncType> }
  pageLifetimes: { [key: string]: FuncArr<GeneralFuncType> }
  observers: { [key: string]: FuncArr<GeneralFuncType> }
  initFuncs: FuncArr<GeneralFuncType>
}

class ChainingPolyfillMetadata {
  initDone = false
  traitGroup = new TraitGroup()
  lifetimes: { [key: string]: FuncArr<GeneralFuncType> }
  pageLifetimes: { [key: string]: FuncArr<GeneralFuncType> }
  observers: { [key: string]: FuncArr<GeneralFuncType> }

  constructor(init: ChainingPolyfillInitData) {
    const cloneMap = (src: { [k: string]: FuncArr<any> }) => {
      const dest = {} as typeof src
      const keys = Object.keys(src)
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]!
        dest[key] = src[key].clone()
      }
      return dest
    }
    this.lifetimes = cloneMap(init.lifetimes)
    this.pageLifetimes = cloneMap(init.pageLifetimes)
    this.observers = cloneMap(init.observers)
  }

  setInitDone() {
    this.initDone = true
  }

  generateBuilderContext(self: GeneralComponent): BuilderContext<any, any, any> {
    return {
      self,
      data: self.data,
      setData: (data, callback) => {
        if (!this.initDone) {
          throw new Error('Cannot set-data before initialization done')
        }
        self.setData(data, callback)
      },
      implement: (trait_behavior: TraitBehavior<any, any>, impl: any) => {
        if (this.initDone) {
          throw new Error('Cannot execute init-time functions after initialization')
        }
        this.traitGroup.implement(trait_behavior, impl)
      },
      observer: (paths: any, func: (newValue: any) => void) => {
        if (this.initDone) {
          throw new Error('Cannot execute init-time functions after initialization')
        }
        const fields = typeof paths === 'string' ? paths : paths.join(', ')
        const funcs = this.observers[fields]
        if (!funcs) {
          throw new Error(
            'The `observer` call should has a corresponding `.observer` call in chaining',
          )
        }
        funcs.add(func)
      },
      lifetime: (name: string, func: () => void) => {
        if (this.initDone) {
          throw new Error('Cannot execute init-time functions after initialization')
        }
        if (!this.lifetimes[name]) this.lifetimes[name] = new FuncArr()
        this.lifetimes[name].add(func)
      },
      pageLifetime: (name: string, func: () => void) => {
        if (this.initDone) {
          throw new Error('Cannot execute init-time functions after initialization')
        }
        if (!this.pageLifetimes[name]) this.pageLifetimes[name] = new FuncArr()
        this.pageLifetimes[name].add(func)
      },
      method: tagMethod,
      listener: tagMethod as any,
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

  callLifetime(caller: unknown, name: string, ...args: any[]) {
    const funcs = this.lifetimes[name]
    if (!funcs) return
    funcs.call(caller, args)
  }

  callPageLifetime(caller: unknown, name: string, ...args: any[]) {
    const funcs = this.pageLifetimes[name]
    if (!funcs) return
    funcs.call(caller, args)
  }
}

const getChainingPolyfillMetadata = (comp: GeneralComponent): ChainingPolyfillMetadata => {
  return comp._$chainingPolyfill
}

// const takeChainingPolyfillInitData = (
//   comp: GeneralComponent,
// ): ChainingPolyfillInitData | undefined => {
//   const id = comp.data._$chainingPolyfillId
//   if (!(id >= 0)) return undefined
//   comp.data._$chainingPolyfillId = -1
//   const initData = initDataMap[id]
//   const cloneMap = (src: { [k: string]: FuncArr<any> }) => {
//     const dest = {} as typeof src
//     const keys = Object.keys(src)
//     for (let i = 0; i < keys.length; i += 1) {
//       const key = keys[i]!
//       dest[key] = src[key].clone()
//     }
//     return dest
//   }
//   return {
//     lifetimes: cloneMap(initData.lifetimes),
//     pageLifetimes: cloneMap(initData.pageLifetimes),
//     observers: cloneMap(initData.observers),
//     initFuncs: initData.initFuncs.clone(),
//   }
// }

const generateChainingPolyfillBehavior = (initData: ChainingPolyfillInitData) => {
  return Behavior({
    lifetimes: {
      created() {
        const chainingPolyfillMetadata = new ChainingPolyfillMetadata(initData)
        ;(this as any)._$chainingPolyfill = chainingPolyfillMetadata
        const ctx = chainingPolyfillMetadata.generateBuilderContext(this as any)
        initData.initFuncs.call(this, [ctx, chainingPolyfillMetadata])
        chainingPolyfillMetadata.setInitDone()
      },
    },
    methods: {
      traitBehavior<TOut extends { [x: string]: any }>(
        traitBehavior: TraitBehavior<any, TOut>,
      ): TOut | undefined {
        return getChainingPolyfillMetadata(this).traitGroup.get(traitBehavior)
      },
    },
  })
}

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
  private _$initData = {
    lifetimes: {},
    pageLifetimes: {},
    observers: {},
    initFuncs: new FuncArr(),
  } as ChainingPolyfillInitData
  protected _$definition = {
    data: {} as DataList,
    properties: {} as WechatMiniprogram.Behavior.PropertyOption,
    methods: {} as MethodList,
    behaviors: [generateChainingPolyfillBehavior(this._$initData)],
    lifetimes: {
      created() {
        getChainingPolyfillMetadata(this).callLifetime(this, 'created')
      },
      attached() {
        getChainingPolyfillMetadata(this).callLifetime(this, 'attached')
      },
      moved() {
        getChainingPolyfillMetadata(this).callLifetime(this, 'moved')
      },
      detached() {
        getChainingPolyfillMetadata(this).callLifetime(this, 'detached')
      },
      ready() {
        getChainingPolyfillMetadata(this).callLifetime(this, 'ready')
      },
    },
    pageLifetimes: {
      show() {
        getChainingPolyfillMetadata(this).callPageLifetime(this, 'show')
      },
      hide() {
        getChainingPolyfillMetadata(this).callPageLifetime(this, 'hide')
      },
      resize(size: unknown) {
        getChainingPolyfillMetadata(this).callPageLifetime(this, 'resize', size)
      },
    },
    observers: [] as { fields: string; observer: GeneralFuncType }[],
    relations: {} as { [key: string]: WechatMiniprogram.Component.RelationOption },
    externalClasses: [] as string[],
    export: undefined as undefined | (() => TComponentExport),
    options: undefined as undefined | WechatMiniprogram.Component.ComponentOptions,
  }

  constructor() {
    // make observer '**' automatically available
    this.observer('**', () => {})
  }

  /** Add external classes */
  externalClasses(list: string[]): this {
    const def = this._$definition
    if (def.externalClasses) def.externalClasses = def.externalClasses.concat(list)
    else def.externalClasses = list
    return this
  }

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
    >
  > {
    if (!this._$definition.export) this._$definition.behaviors.unshift('wx://component-export')
    this._$definition.export = f as any
    return this as any
  }

  staticData<T extends DataList>(
    data: NewFieldList<AllData<TData, TProperty>, T>,
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
    >
  > {
    Object.assign(this._$definition.data, data)
    return this as any
  }

  property<N extends string, T extends PropertyType>(
    name: N,
    def: N extends keyof (TData & TProperty) ? never : T,
  ): ResolveBehaviorBuilder<
    BaseBehaviorBuilder<
      TPrevData,
      TData,
      TProperty & Record<N, T>,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >
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
    >
  > {
    Object.assign(this._$definition.methods, funcs)
    return this as any
  }

  /**
   * Add a data observer
   */
  observer<
    P extends ObserverDataPathStrings<AllData<TPrevData, TProperty>>,
    V = GetFromObserverPathString<AllData<TPrevData, TProperty>, P>,
  >(
    paths: P,
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, newValue: V) => void,
  ): ResolveBehaviorBuilder<this>
  observer<
    P extends ObserverDataPathStrings<AllData<TPrevData, TProperty>>[],
    V = {
      [K in keyof P]: GetFromObserverPathString<AllData<TPrevData, TProperty>, P[K]>
    },
  >(
    paths: readonly [...P],
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      ...newValues: V extends any[] ? V : never
    ) => void,
  ): ResolveBehaviorBuilder<this>
  observer(
    paths: string | readonly string[],
    func: (this: Component<TData, TProperty, TMethod, TExtraThisFields>, ...args: any[]) => any,
  ): ResolveBehaviorBuilder<this> {
    const fields = typeof paths === 'string' ? paths : paths.join(', ')
    const assistObservers = new FuncArr()
    assistObservers.add(func)
    const observer = function (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      ...args: any[]
    ) {
      assistObservers.call(this, args)
    }
    this._$definition.observers.push({ fields, observer })
    const observers = this._$initData.observers
    observers[fields] = assistObservers
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
  ): ResolveBehaviorBuilder<this> {
    const lifetimes = this._$initData.lifetimes
    if (!lifetimes[name]) {
      lifetimes[name] = new FuncArr()
    }
    lifetimes[name].add(func)
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
  ): ResolveBehaviorBuilder<this> {
    const pageLifetimes = this._$initData.pageLifetimes
    if (!pageLifetimes[name]) {
      pageLifetimes[name] = new FuncArr()
    }
    pageLifetimes[name].add(func)
    return this as any
  }

  /**
   * Add a relation
   */
  relation(
    name: string,
    rel: WechatMiniprogram.Component.RelationOption &
      ThisType<Component<TData, TProperty, TMethod, TExtraThisFields>>,
  ): ResolveBehaviorBuilder<this> {
    this._$definition.relations[name] = rel
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
    >
  > {
    this._$initData.initFuncs.add((ctx, meta: ChainingPolyfillMetadata) => {
      const comp = ctx.self
      const exported = func.call(comp, ctx)
      meta.handleBuilderContextExport(comp, exported)
    })
    return this as any
  }

  definition<
    TNewData extends DataList = Empty,
    TNewProperty extends PropertyList = Empty,
    TNewMethod extends MethodList = Empty,
    TNewComponentExport = never,
  >(
    definition: ClassicDefinition<TNewData, TNewProperty, TNewMethod> &
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
    >
  > {
    const {
      behaviors,
      properties: rawProperties,
      data: rawData,
      observers: rawObservers,
      methods,
      created,
      attached,
      ready,
      moved,
      detached,
      lifetimes: rawLifetimes,
      pageLifetimes: rawPageLifetimes,
      relations: rawRelations,
      externalClasses,
      export: exports,
    } = definition
    if (behaviors) {
      this._$definition.behaviors.push(...(behaviors as any[]))
    }
    if (rawProperties) {
      Object.assign(this._$definition.properties, rawProperties)
    }
    Object.assign(this._$definition.data, rawData)
    if (rawObservers !== undefined) {
      if (Array.isArray(rawObservers)) {
        this._$definition.observers.push(...rawObservers)
      } else {
        const keys = Object.keys(rawObservers)
        for (let i = 0; i < keys.length; i += 1) {
          const fields = keys[i]!
          const observer = rawObservers[fields]!
          this._$definition.observers.push({ fields, observer })
        }
      }
    }
    if (methods) this.methods(methods)
    if (created && rawLifetimes?.created === undefined) this.lifetime('created', created)
    if (attached && rawLifetimes?.attached === undefined) this.lifetime('attached', attached)
    if (ready && rawLifetimes?.ready === undefined) this.lifetime('ready', ready)
    if (moved && rawLifetimes?.moved === undefined) this.lifetime('moved', moved)
    if (detached && rawLifetimes?.detached === undefined) this.lifetime('detached', detached)
    if (rawLifetimes) {
      const keys = Object.keys(rawLifetimes)
      for (let i = 0; i < keys.length; i += 1) {
        const name = keys[i]!
        const func = (rawLifetimes as any)[name]
        this.lifetime(name as any, func)
      }
    }
    if (rawPageLifetimes) {
      const keys = Object.keys(rawPageLifetimes)
      for (let i = 0; i < keys.length; i += 1) {
        const name = keys[i]!
        const func = (rawPageLifetimes as any)[name]!
        this.pageLifetime(name as any, func)
      }
    }
    if (rawRelations) {
      Object.assign(this._$definition.relations, rawRelations)
    }
    if (externalClasses) this.externalClasses(externalClasses)
    if (exports) this.export(exports)
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
  setData: (this: void, newData: Partial<SetDataSetter<TPrevData>>, callback?: () => void) => void
  implement: <TIn extends { [x: string]: any }>(
    this: void,
    traitBehavior: TraitBehavior<TIn, any>,
    impl: TIn,
  ) => void
  observer<
    P extends ObserverDataPathStrings<AllData<TPrevData, TProperty>>,
    V = GetFromObserverPathString<AllData<TPrevData, TProperty>, P>,
  >(
    this: void,
    paths: P,
    func: (newValue: V) => void,
  ): void
  observer<
    P extends ObserverDataPathStrings<AllData<TPrevData, TProperty>>[],
    V = {
      [K in keyof P]: GetFromObserverPathString<AllData<TPrevData, TProperty>, P[K]>
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

export type ClassicDefinition<
  TData extends WechatMiniprogram.Component.DataOption,
  TProperty extends WechatMiniprogram.Component.PropertyOption,
  TMethod extends WechatMiniprogram.Component.MethodOption,
> = Optional<WechatMiniprogram.Component.Data<TData>> &
  Optional<WechatMiniprogram.Component.Property<TProperty>> &
  Optional<WechatMiniprogram.Component.Method<TMethod>> &
  Optional<WechatMiniprogram.Component.Behavior<WechatMiniprogram.Component.BehaviorOption>> &
  Optional<WechatMiniprogram.Component.Lifetimes> &
  Partial<WechatMiniprogram.Component.OtherOption>
