import { TraitBehavior } from './trait_behavior'
import {
  AllData,
  BaseBehaviorBuilder,
  BuilderContext,
  ChainingFilterType,
  ClassicDefinition,
  Component,
  DataList,
  Empty,
  MethodList,
  NewFieldList,
  PropertyList,
  PropertyType,
  ResolveBehaviorBuilder,
} from './base'
import { TaggedMethod, UnTaggedMethod } from './type_utils'

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
  ): WechatMiniprogram.Behavior.BehaviorIdentifier<TData, TProperty, TMethod, TBehavior>
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

export class BehaviorBuilder<
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
  ): BehaviorBuilder<
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
    f: (this: Component<TData, TProperty, TMethod, TExtraThisFields>) => TNewComponentExport,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
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
    BehaviorBuilder<
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
    BehaviorBuilder<
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
    funcs: T & ThisType<Component<TData, TProperty, TMethod, TExtraThisFields>>,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
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
   * The return value is used as the "export" value of the behavior.
   */
  override init<TExport extends Record<string, TaggedMethod<(...args: any[]) => any>> | void>(
    func: (
      this: Component<TData, TProperty, TMethod, TExtraThisFields>,
      builderContext: BuilderContext<
        TPrevData,
        TProperty,
        Component<TData, TProperty, TMethod, TExtraThisFields>
      >,
    ) => TExport,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
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
        Component<
          TData & TNewData,
          TProperty & TNewProperty,
          TMethod & TNewMethod,
          TExtraThisFields
        >
      >,
  ): ResolveBehaviorBuilder<
    BehaviorBuilder<
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
    return this as any
  }

  /**
   * Finish the behavior definition process
   */
  register(): WechatMiniprogram.Behavior.BehaviorIdentifier<TData, TProperty, TMethod> {
    return Behavior(this._$definition as any)
  }

  /**
   * Add extra this fields type
   */
  extraThisFieldsType<T extends DataList>(): ResolveBehaviorBuilder<
    BehaviorBuilder<
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
