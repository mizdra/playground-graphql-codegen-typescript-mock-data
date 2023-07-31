/* eslint-disable no-use-before-define */
type Maybe<T> = T | null;
const expectType: <Type>(value: Type) => void = () => {};

// GraphQL の type のように、循環する relationship を持つ型があるとする。
type A = {
  prop1: number;
  b: B;
  c?: Maybe<C>;
};
type B = {
  prop2: number;
  a: A;
};
type C = {
  prop3: number;
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

// Recursive utility type to terminate circular references with `undefined`.
type TerminateCircularRelationship<T extends Record<string, unknown>, Visited = never> = {
  [K in keyof T]: T[K] extends Visited
    ? undefined
    : T[K] extends Record<string, unknown>
    ? TerminateCircularRelationship<T[K], Visited | T>
    : T[K];
};

// そしてその型のダミーデータを作成する utility (fakeXXX) があるとする。
// fakeXXX は relationship を辿って再帰的にダミーデータを生成するようになっている。
// ただし、fakeXXX の呼び出しが循環しないよう、一度呼び出したことのある fakeXXX は再度呼ばず、
// 代わりに null で埋めるようにしている。
function fakeA<const T extends DeepPartial<A>>(
  overrides: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<A>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('A');
  return {
    prop1: 'prop1' in overrides ? overrides.prop1! : 0,
    b: 'b' in overrides ? overrides.b! : relationshipsToOmit.has('B') ? undefined : fakeB({}, relationshipsToOmit),
  };
}
function fakeB<const T extends DeepPartial<B>>(
  overrides: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<B>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('B');
  return {
    prop2: 'prop2' in overrides ? overrides.prop2! : 0,
    a: 'a' in overrides ? overrides.a! : relationshipsToOmit.has('A') ? undefined : fakeA({}, relationshipsToOmit),
  };
}
function fakeC<const T extends DeepPartial<C>>(
  overrides: T,
  _relationshipsToOmit: Set<string> = new Set(),
): Merge<TerminateCircularRelationship<DeepExcludeMaybe<C>>, Required<T>> {
  const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
  relationshipsToOmit.add('C');
  return {
    prop3: 'prop3' in overrides ? overrides.prop3! : 0,
    b: 'b' in overrides ? overrides.b! : relationshipsToOmit.has('B') ? undefined : fakeB({}, relationshipsToOmit),
  };
}

// この utility が返す型が、以下のようになるよう修正したい。
const a1 = fakeA({});
expectType<{
  prop1: number;
  b: {
    prop2: number;
    a: undefined;
  };
  c: {
    prop3: number;
    b: {
      prop2: number;
      a: undefined;
    };
  };
}>(a1);
console.log(a1);

// また、undefined でオーバーライドできるようになっていてほしい。
const a2 = fakeA({
  prop1: undefined,
  b: fakeB({
    prop2: undefined,
    a: undefined,
  }),
  c: null,
});
expectType<{
  prop1: undefined;
  b: {
    prop2: undefined;
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
  prop1: number;
  b: {
    prop2: number;
    a: {
      prop1: number;
      b: undefined;
      c: undefined;
    };
  };
  c: undefined;
}>(a3);
console.log(a3);
