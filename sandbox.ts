/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-use-before-define */
type Maybe<T> = T | null;
const expectType: <Type>(value: Type) => void = () => {};

// GraphQL の type のように、循環する relationship を持つ型があるとする。
type A = {
  field1: number;
  b: B;
  c?: Maybe<C>;
};
type B = {
  field2: number;
  a: A;
};
type C = {
  field3: number;
  b: B;
};

// https://github.com/type-challenges/type-challenges/issues/608
type Merge<F, S> = {
  [K in keyof F | keyof S]: K extends keyof S ? S[K] : K extends keyof F ? F[K] : never;
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]> | undefined;
    }
  : T;

type DeepExcludeMaybe<T> = T extends object
  ? {
      [P in keyof T]-?: DeepExcludeMaybe<Exclude<T[P], null | undefined>>;
    }
  : T;

type TerminateCircularRelationship<T extends Record<string, unknown>, Visited = never> = {
  [K in keyof T]: T[K] extends Visited
    ? {}
    : T[K] extends Record<string, unknown>
    ? TerminateCircularRelationship<T[K], Visited | T>
    : T[K];
};

// そしてその型のダミーデータを作成する utility (fakeXXX) があるとする。
// fakeXXX は relationship を辿って再帰的にダミーデータを生成するようになっている。
// ただし、fakeXXX の呼び出しが循環しないよう、一度呼び出したことのある fakeXXX は再度呼ばず、
// 代わりに null で埋めるようにしている。
function fakeA<const T extends DeepPartial<A> = {}>(
  overrides?: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<A>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('A');
  return {
    field1: 'field1' in overrides ? overrides.field1! : 0,
    b: 'b' in overrides ? overrides.b! : relationshipsToOmit.has('B') ? {} : fakeB({}, relationshipsToOmit),
  } as any;
}
function fakeB<const T extends DeepPartial<B> = {}>(
  overrides?: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<B>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('B');
  return {
    field2: 'field2' in overrides ? overrides.field2! : 0,
    a: 'a' in overrides ? overrides.a! : relationshipsToOmit.has('A') ? {} : fakeA({}, relationshipsToOmit),
  } as any;
}
function fakeC<const T extends DeepPartial<C> = {}>(
  overrides?: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<C>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('C');
  return {
    field3: 'field3' in overrides ? overrides.field3! : 0,
    b: 'b' in overrides ? overrides.b! : relationshipsToOmit.has('B') ? {} : fakeB({}, relationshipsToOmit),
  } as any;
}

// この utility が返す型が、以下のようになるよう修正したい。
const a1 = fakeA();
expectType<{
  field1: number;
  b: {
    field2: number;
    a: {};
  };
  c: {
    field3: number;
    b: {
      field2: number;
      a: {};
    };
  };
}>(a1);
console.log(a1);

// また、undefined でオーバーライドできるようになっていてほしい。
const a2 = fakeA({
  field1: undefined,
  b: fakeB({
    field2: undefined,
    a: undefined,
  }),
  c: null,
});
expectType<{
  field1: undefined;
  b: {
    field2: undefined;
    a: undefined;
  };
  c: null;
}>(a2);
console.log(a2);

// 循環する relationship も、明示的に引数を渡せば undefined でない値に変えられるようになっていてほしい。
const a3 = fakeA({
  b: fakeB({
    a: fakeA({
      b: undefined,
      c: undefined,
    }),
  }),
  c: undefined,
});
expectType<{
  field1: number;
  b: {
    field2: number;
    a: {
      field1: number;
      b: undefined;
      c: undefined;
    };
  };
  c: undefined;
}>(a3);
console.log(a3);
