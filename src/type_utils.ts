/**
 * UnionToIntersection<'foo' | 42 | true> = 'foo' & 42 & true
 * UnionToIntersection<(() => 'foo') | ((i: 42) => true)> = (() => 'foo') & ((i: 42) => true)
 */
export type UnionToIntersection<T> = (T extends unknown ? (arg: T) => void : never) extends (
  args: infer Arg,
) => void
  ? Arg
  : never

type SetDataStringPath<K extends string | number, Prefix extends string> = [Prefix] extends [never]
  ? `${K}`
  : K extends number
    ? `${Prefix}[${K}]`
    : `${Prefix}.${K}`

/**
 * SetDataSetter<{ name: string; foo: { bar: number } }> = {
 *   name: string,
 *   foo: { bar: number },
 *   'foo.bar': number,
 * }
 * setDataSetter<{ list: number[], foo: { bar: number }[]}> = {
 *   list: number[],
 *   `list[${number}]`: number,
 *   foo: { bar: number }[],
 *   `foo[${number}]`: { bar: number }[],
 *   `foo[${number}].bar`: number,
 * }
 */
export type SetDataSetter<
  T,
  Prefix extends string = never,
  Count extends number = 4,
> = Count extends 0
  ? Record<SetDataStringPath<any, Prefix>, T>
  : IsAny<T> extends true
    ? Record<SetDataStringPath<any, Prefix>, T>
    : UnionToIntersection<
        T extends any[]
          ? {
              [P in keyof T & number]: SetDataSetter<
                T[P],
                SetDataStringPath<P, Prefix>,
                Subtract<Count, 1>
              > &
                Record<SetDataStringPath<P, Prefix>, T[P]>
            }[keyof T & number]
          : T extends Record<string | number, any>
            ? {
                [P in keyof T & (string | number)]: SetDataSetter<
                  T[P],
                  SetDataStringPath<P, Prefix>,
                  Subtract<Count, 1>
                > &
                  Record<SetDataStringPath<P, Prefix>, T[P]>
              }[keyof T & (string | number)]
            : never
      >

/**
 * IsAny<any> = true
 * IsAny<{}> = false
 */
export type IsAny<T> =
  (<S>(S: S) => S extends T ? 1 : 2) extends <R>(R: R) => R extends any ? 1 : 2 ? true : false

type Tuple<T, Res extends 1[] = []> = 0 extends 1
  ? never
  : Res['length'] extends T
    ? Res
    : Tuple<T, [...Res, 1]>

type Subtract<M extends number, S extends number> =
  Tuple<M> extends [...Tuple<S>, ...infer Rest] ? Rest['length'] : never

/**
 * ObjectDataPathStrings<{ name: string; age: number }> = 'name' | 'age'
 * ObjectDataPathStrings<{
 *   refCount: number;
 *   person: { name: string; age: number };
 * }> = 'refCount' | 'person' | 'person.name' | 'person.age'
 * ObjectDataPathStrings<{ books: [{ name: string; price: number }] }> =
 *   'books' | `books[${number}]` | `books[${number}].name` | `books[${number}].price`
 */
export type ObjectDataPathStrings<
  T,
  Prefix extends string = never,
  Count extends number = 4,
> = Count extends 0
  ? SetDataStringPath<any, Prefix>
  : IsAny<T> extends true
    ? SetDataStringPath<any, Prefix>
    : T extends any[]
      ? {
          [P in keyof T & number]:
            | SetDataStringPath<P, Prefix>
            | ObjectDataPathStrings<T[P], SetDataStringPath<P, Prefix>, Subtract<Count, 1>>
        }[keyof T & number]
      : T extends Record<string | number, any>
        ? {
            [P in keyof T & (string | number)]:
              | SetDataStringPath<P, Prefix>
              | ObjectDataPathStrings<T[P], SetDataStringPath<P, Prefix>, Subtract<Count, 1>>
          }[keyof T & (string | number)]
        : Prefix

export type ObserverDataPathStrings<T, S extends string = ObjectDataPathStrings<T>> =
  | '**'
  | S
  | `${S}.**`

/**
 * GetFromDataPathString<{ name: string; age: number }, 'name'> = string
 * GetFromDataPathString<{ person: { name: string; age: number } }, 'person.name'> = string
 * GetFromDataPathString<{ books: [{ name: string; price: number }] }, 'books[0].name'> = string
 */
export type GetFromDataPathString<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends ''
    ? T
    : P extends `[${infer K extends keyof T & number}].${infer R}`
      ? GetFromDataPathString<T[K], R>
      : P extends `[${infer K extends keyof T & number}]${infer R}`
        ? GetFromDataPathString<T[K], R>
        : P extends `${infer K extends keyof T & string}[${infer R}`
          ? GetFromDataPathString<T[K], `[${R}`>
          : P extends `${infer K extends keyof T & string}.${infer R}`
            ? GetFromDataPathString<T[K], R>
            : never

export type GetFromObserverPathString<T, P extends string> = P extends '**'
  ? GetFromDataPathString<T, ''>
  : P extends `${infer K}.**`
    ? GetFromDataPathString<T, K>
    : GetFromDataPathString<T, P>

export const METHOD_TAG = Symbol('method')

type Tagged = typeof METHOD_TAG

type IfNeverOrAny<T, Replacement> = [T] extends [never]
  ? Replacement
  : 1 extends T & 0
    ? Replacement
    : T

type GetTags<B> = B extends {
  readonly [Tag in Tagged]: infer Tags extends symbol[]
}
  ? Tags
  : []

export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

type GetTagsWithout<B, T extends symbol, Tags = GetTags<B>> = Tags extends [infer F, ...infer R]
  ? Equal<T, F> extends true
    ? GetTagsWithout<B, T, R>
    : [F, ...GetTagsWithout<B, T, R>]
  : []

type UnTagAll<B> = Tagged extends keyof IfNeverOrAny<B, unknown>
  ? B extends infer Origin & { readonly [Tag in Tagged]: GetTags<B> }
    ? Origin
    : B
  : B

export type Tag<B, T extends symbol> = [IfNeverOrAny<B, unknown>] extends [null | undefined]
  ? B
  : UnTagAll<B> & { readonly [Tag in Tagged]: [...GetTags<B>, T] }

export type UnTag<
  B,
  T extends symbol,
  Tags = GetTagsWithout<B, T>,
> = Tagged extends keyof IfNeverOrAny<B, unknown>
  ? Tags extends []
    ? UnTagAll<B>
    : UnTagAll<B> & { readonly [Tag in Tagged]: Tags }
  : B

export type HasTag<B, T extends symbol> = T extends GetTags<B>[number] ? true : false

export type TaggedMethod<Fn> = Tag<Fn, typeof METHOD_TAG>

export type UnTaggedMethod<M extends TaggedMethod<any>> = UnTag<M, typeof METHOD_TAG>
