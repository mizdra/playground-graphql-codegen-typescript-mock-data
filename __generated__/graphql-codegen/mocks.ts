import casual from 'casual';
import { A, B, C } from './types';

casual.seed(0);

export const fakeA = (overrides?: Partial<A>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'A' } & A => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('A');
    return {
        __typename: 'A',
        b: overrides && overrides.hasOwnProperty('b') ? overrides.b! : relationshipsToOmit.has('B') ? {} as B : fakeB({}, relationshipsToOmit),
        c: overrides && overrides.hasOwnProperty('c') ? overrides.c! : relationshipsToOmit.has('C') ? {} as C : fakeC({}, relationshipsToOmit),
        field1: overrides && overrides.hasOwnProperty('field1') ? overrides.field1! : casual.integer(0, 9999),
    };
};

export const fakeB = (overrides?: Partial<B>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'B' } & B => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('B');
    return {
        __typename: 'B',
        a: overrides && overrides.hasOwnProperty('a') ? overrides.a! : relationshipsToOmit.has('A') ? {} as A : fakeA({}, relationshipsToOmit),
        field2: overrides && overrides.hasOwnProperty('field2') ? overrides.field2! : casual.integer(0, 9999),
    };
};

export const fakeC = (overrides?: Partial<C>, _relationshipsToOmit: Set<string> = new Set()): { __typename: 'C' } & C => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('C');
    return {
        __typename: 'C',
        b: overrides && overrides.hasOwnProperty('b') ? overrides.b! : relationshipsToOmit.has('B') ? {} as B : fakeB({}, relationshipsToOmit),
        field3: overrides && overrides.hasOwnProperty('field3') ? overrides.field3! : casual.integer(0, 9999),
    };
};

export const seedMocks = (seed: number) => casual.seed(seed);
