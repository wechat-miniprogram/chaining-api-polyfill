import {
  AllData,
  BaseBehaviorBuilder,
  BuilderContext,
  ChainingFilterType,
  Component as BaseComponent,
  DataList,
  Empty,
  MethodList,
  NewFieldList,
  PropertyList,
  PropertyType,
  ResolveBehaviorBuilder,
  ClassicDefinition,
} from './base'
import { TaggedMethod, UnTaggedMethod } from './type_utils'

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
  options(options: WechatMiniprogram.Component.ComponentOptions): ResolveBehaviorBuilder<this> {
    this._$definition.options = options
    return this as any
  }

  /** Use another behavior */
  behavior<
    UData extends DataList,
    UProperty extends PropertyList,
    UMethod extends MethodList,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _UChainingFilter extends ChainingFilterType,
    UExtraThisFields extends DataList,
  >(
    behavior: WechatMiniprogram.Behavior.BehaviorIdentifier<UData, UProperty, UMethod, []>,
  ): ComponentBuilder<
    TPrevData,
    TData & UData,
    TProperty & UProperty,
    TMethod & UMethod,
    TPendingChainingFilter,
    TChainingFilter,
    TComponentExport,
    TExtraThisFields & UExtraThisFields
  > {
    this._$definition.behaviors.push(behavior as any)
    return this as any
  }

  /** Set the export value when the component is being selected */
  override export<TNewComponentExport>(
    f: () => TNewComponentExport,
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
    >
  > {
    return super.export(f) as any
  }

  /**
   * Add some template data fields
   *
   * The data should be JSON-compatible, and will be cloned during component creation.
   */
  override staticData<T extends DataList>(
    data: NewFieldList<AllData<TData, TProperty>, T>,
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
    >
  > {
    return super.staticData(data) as any
  }

  /**
   * Add a single property
   *
   * The property name should be different from other properties.
   */
  override property<N extends string, T extends PropertyType>(
    name: N,
    def: N extends keyof (TData & TProperty) ? never : T,
  ): ResolveBehaviorBuilder<
    ComponentBuilder<
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
    return super.property(name, def) as any
  }

  /**
   * Add some public methods
   *
   * The public method can be used as an event handler, and can be visited in component instance.
   */
  override methods<T extends MethodList>(
    funcs: T & ThisType<BaseComponent<TData, TProperty, TMethod, TExtraThisFields>>,
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
    >
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
      this: BaseComponent<TData, TProperty, TMethod, TExtraThisFields>,
      builderContext: BuilderContext<
        TPrevData,
        TProperty,
        BaseComponent<TData, TProperty, TMethod, TExtraThisFields>
      >,
    ) => TExport,
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
    >
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
    definition: ClassicDefinition<TNewData, TNewProperty, TNewMethod> &
      ThisType<
        BaseComponent<
          TData & TNewData,
          TProperty & TNewProperty,
          TMethod & TNewMethod,
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
    >
  > {
    super.definition(definition)
    if (definition.options) this.options(definition.options)
    return this as any
  }

  /**
   * Finish the component definition process
   */
  register(): string {
    return Component(this._$definition as any)
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
    >
  > {
    return this as any
  }
}
