import { typeUtils } from 'glass-easel'
import { TraitBehavior } from './trait_behavior'
import {
  BaseBehaviorBuilder,
  ChainingFilterType,
  DataList,
  Empty,
  MethodList,
  PropertyList,
  ResolveBehaviorBuilder,
} from './base'

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
  private _$definitionFilter: WechatMiniprogram.Behavior.DefinitionFilter | undefined

  /** Use another behavior */
  behavior<
    UData extends DataList,
    UProperty extends PropertyList,
    UMethod extends MethodList,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _UChainingFilter extends ChainingFilterType,
    UExtraThisFields extends DataList,
  >(
    behavior: WechatMiniprogram.Behavior.Instance<UData, UProperty, UMethod, any, UExtraThisFields>,
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
    this._$definition.behaviors.push(behavior)
    return this as any
  }

  /** Set the export value when the component is being selected */
  override export<TNewComponentExport>(
    f: (this: GeneralComponent, source: GeneralComponent | null) => TNewComponentExport,
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
    >,
    TChainingFilter
  > {
    return super.export(f) as any
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
    BehaviorBuilder<
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
    BehaviorBuilder<
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
    BehaviorBuilder<
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
    def: BehaviorDefinition<TNewData, TNewProperty, TNewMethod, TNewComponentExport> &
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
    BehaviorBuilder<
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
    if (def.definitionFilter) this._$definitionFilter = def.definitionFilter
    return this as any
  }

  /**
   * Finish the behavior definition process
   */
  register(): Behavior<
    TData,
    TProperty,
    TMethod,
    TPendingChainingFilter,
    TComponentExport,
    TExtraThisFields
  > {
    return new Behavior(
      this._$.registerBehavior(),
      this._$parents,
      this._$definitionFilter,
      this._$chainingFilter,
      this._$export,
    )
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
    >,
    TChainingFilter
  > {
    return this as any
  }
}
