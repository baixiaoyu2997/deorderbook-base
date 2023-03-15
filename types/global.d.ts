/* eslint-disable import/export */

declare module '#i18n' {
  export * from 'vue-i18n'
  export * from 'vue-i18n-routing'
}
declare interface Window {
  ethereum: any
  BinanceChain: any
  switchChain: any
}

declare module '*.png' {
  const value: string
  export = value
}

declare type NonEmptyArray<T> = [T, ...T[]]

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never

// TS4.0+
type Push<T extends any[], V> = [...T, V]
// TS4.1+
type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>
// 转换对象为元祖类型
declare type ObjValueTuple<
  T,
  KS extends any[] = TuplifyUnion<keyof T>,
  R extends any[] = []
> = KS extends [infer K, ...infer KT]
  ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
  : R
