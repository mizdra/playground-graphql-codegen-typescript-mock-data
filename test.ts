/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/ban-types */

import { fakeA, fakeB } from './__generated__/graphql-codegen/mocks.js';

const expectType: <Type>(value: Type) => void = () => {};

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
