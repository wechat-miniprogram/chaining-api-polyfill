import { BaseBehaviorBuilder, ChainingFilterType, DataList, Empty, MethodList, PropertyList } from './base'

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

export class ComponentBuilder<
  TPrevData extends DataList = Empty,
  TData extends DataList = Empty,
  TProperty extends PropertyList = Empty,
  TMethod extends MethodList = Empty,
  TChainingFilter extends ChainingFilterType = never,
  TPendingChainingFilter extends ChainingFilterType = never,
  TComponentExport = never,
  TExtraThisFields extends DataList = Empty,
> extends BaseBehaviorBuilder<
  TPrevData,
  TData,
  TProperty,
  TMethod,
  TChainingFilter,
  TPendingChainingFilter,
  TComponentExport,
  TExtraThisFields
> {
  /**
   * Set the component options
   *
   * If called multiple times, only the latest call is valid.
   */
  options(options: ComponentDefinitionOptions): ResolveBehaviorBuilder<this, TChainingFilter> {
    this._$options = options
    return this as any
  }

  /** Use another behavior */
  behavior<
    UData extends DataList,
    UProperty extends PropertyList,
    UMethod extends MethodList,
    UChainingFilter extends ChainingFilterType,
    UComponentExport,
    UExtraThisFields extends DataList,
  >(
    behavior: Behavior<
      UData,
      UProperty,
      UMethod,
      UChainingFilter,
      UComponentExport,
      UExtraThisFields
    >,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
      TPrevData,
      TData & UData,
      TProperty & UProperty,
      TMethod & UMethod,
      UChainingFilter,
      TPendingChainingFilter,
      UComponentExport,
      TExtraThisFields & UExtraThisFields
    >,
    UChainingFilter
  > {
    this._$parents.push(behavior as GeneralBehavior)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._$ = this._$.behavior(behavior._$)
    if (behavior._$export) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this._$export = behavior._$export as any
    }
    if (behavior._$chainingFilter) {
      return behavior._$chainingFilter(this as any)
    }
    return this as any
  }

  /** Set the export value when the component is being selected */
  override export<TNewComponentExport>(
    f: (this: GeneralComponent, source: GeneralComponent | null) => TNewComponentExport,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._$export = f as any
    return this as any
  }

  /**
   * Add some template data fields
   *
   * It does not support raw data, but a `gen` function which returns the new data fields.
   * The `gen` function executes once during component creation.
   */
  override data<T extends DataList>(
    gen: () => typeUtils.NewFieldList<AllData<TData, TProperty>, T>,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    return super.data(gen) as any
  }

  /**
   * Add a single property
   *
   * The property name should be different from other properties.
   */
  override property<N extends string, T extends PropertyType, V extends PropertyTypeToValueType<T>>(
    name: N,
    def: N extends keyof (TData & TProperty) ? never : typeUtils.PropertyListItem<T, V>,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    return super.property(name, def) as any
  }

  /**
   * Add some public methods
   *
   * The public method can be used as an event handler, and can be visited in component instance.
   */
  override methods<T extends MethodList>(
    funcs: T & ThisType<Component<TData, TProperty, TMethod & T, any, TExtraThisFields>>,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    return super.methods(funcs) as any
  }

  /**
   * Execute a function while component instance creation
   *
   * A `BuilderContext` is provided to tweak the component creation progress.
   * The return value is used as the "export" value of the behavior,
   * which can be imported by other behaviors.
   */
  override init<TExport extends Record<string, TaggedMethod<(...args: any[]) => any>> | void>(
    func: (
      this: Component<TData, TProperty, TMethod, TComponentExport, TExtraThisFields>,
      builderContext: BuilderContext<
        TPrevData,
        TProperty,
        Component<TData, TProperty, TMethod, TComponentExport, TExtraThisFields>
      >,
    ) => TExport,
    // eslint-disable-next-line function-paren-newline
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    return super.init(func) as any
  }

  /** Apply a classic definition object */
  override definition<
    TNewData extends DataList = Empty,
    TNewProperty extends PropertyList = Empty,
    TNewMethod extends MethodList = Empty,
    TNewComponentExport = never,
  >(
    def: ComponentDefinition<TNewData, TNewProperty, TNewMethod, TNewComponentExport> &
      ThisType<
        Component<
          TData & TNewData,
          TProperty & TNewProperty,
          TMethod & TNewMethod,
          TNewComponentExport,
          TExtraThisFields
        >
      >,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    super.definition(def)
    if (def.options) this.options(def.options)
    return this as any
  }

  pageDefinition<TNewData extends DataList, TNewExtraFields extends { [k: PropertyKey]: any }>(
    def: PageDefinition<TNewData, TNewExtraFields> &
      ThisType<
        Component<
          TData & TNewData,
          TProperty,
          TMethod & TNewExtraFields,
          undefined,
          TExtraThisFields
        >
      >,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
      TPrevData,
      TData & TNewData,
      TProperty,
      TMethod & TNewExtraFields,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields
    >,
    TChainingFilter
  > {
    const customFields = Object.create(null) as { [k: string]: unknown }
    const compDef = {
      methods: {},
    } as { [k: string]: any }
    const keys = Object.keys(def)
    for (let i = 0; i < keys.length; i += 1) {
      const k = keys[i]!
      if (k === 'data') {
        compDef.data = def.data
      } else if (typeof def[k] === 'function') {
        ;(compDef.methods as { [k: string]: unknown })[k] = def[k] as unknown
      } else if (k === 'methods') {
        customFields.methods = def.methods
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        compDef[k] = def[k]
      }
    }
    this.definition(compDef)
    const keys2 = Object.keys(compDef)
    for (let i = 0; i < keys2.length; i += 1) {
      const k = keys2[i]!
      if (k === 'data' || k === 'methods' || k === 'behaviors') continue
      customFields[k] = compDef[k]
    }
    this._$.init(function () {
      Object.assign(this, glassEasel.dataUtils.simpleDeepCopy(customFields))
    })
    return this as any
  }

  /**
   * Finish the component definition process
   */
  register(): ComponentType<TData, TProperty, TMethod, TComponentExport> {
    const is = this._$is
    const codeSpace = this._$codeSpace

    // processing common fields
    const [options, styleIsolation] = codeSpace.prepareComponentOptions(is, this._$options)
    this._$.options(options)
    const staticConfig = codeSpace.getComponentStaticConfig(is)
    const using = staticConfig?.usingComponents
    const generics = staticConfig?.componentGenerics
    const placeholder = staticConfig?.componentPlaceholder
    if (using) this._$.usingComponents(using)
    if (generics) this._$.generics(generics)
    if (placeholder) this._$.placeholders(placeholder)
    const template = codeSpace.getCompiledTemplate(is)
    if (template) this._$.template(template)

    // do registration
    codeSpace._$styleIsolationMap[is] = styleIsolation
    const compDef = this._$.registerComponent()
    this._$alias?.forEach((alias) => {
      this._$codeSpace.getComponentSpace().exportComponent(alias, this._$is)
    })
    return new ComponentType(compDef)
  }

  /**
   * Add extra this fields type
   */
  extraThisFieldsType<T extends DataList>(): ResolveBehaviorBuilder<
    ComponentBuilder<
      TPrevData,
      TData,
      TProperty,
      TMethod,
      TChainingFilter,
      TPendingChainingFilter,
      TComponentExport,
      TExtraThisFields & T
    >,
    TChainingFilter
  > {
    return this as any
  }
}
