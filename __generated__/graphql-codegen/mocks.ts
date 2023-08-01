import casual from 'casual';
import { A, B, C } from './types';

casual.seed(0);

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

export const fakeA = <const T extends DeepPartial<A> = {}>(overrides?: Partial<A>, _relationshipsToOmit: Set<string> = new Set()): Merge<TerminateCircularRelationship<DeepExcludeMaybe<{ __typename: 'A' } & A>>, Required<T>> => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('A');
    return {
        __typename: 'A',
        b: overrides && overrides.hasOwnProperty('b') ? overrides.b! : relationshipsToOmit.has('B') ? {} as B : fakeB({}, relationshipsToOmit),
        c: overrides && overrides.hasOwnProperty('c') ? overrides.c! : relationshipsToOmit.has('C') ? {} as C : fakeC({}, relationshipsToOmit),
        field1: overrides && overrides.hasOwnProperty('field1') ? overrides.field1! : casual.integer(0, 9999),
    } as any;
};

export const fakeB = <const T extends DeepPartial<B> = {}>(overrides?: Partial<B>, _relationshipsToOmit: Set<string> = new Set()): Merge<TerminateCircularRelationship<DeepExcludeMaybe<{ __typename: 'B' } & B>>, Required<T>> => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('B');
    return {
        __typename: 'B',
        a: overrides && overrides.hasOwnProperty('a') ? overrides.a! : relationshipsToOmit.has('A') ? {} as A : fakeA({}, relationshipsToOmit),
        field2: overrides && overrides.hasOwnProperty('field2') ? overrides.field2! : casual.integer(0, 9999),
    } as any;
};

export const fakeC = <const T extends DeepPartial<C> = {}>(overrides?: Partial<C>, _relationshipsToOmit: Set<string> = new Set()): Merge<TerminateCircularRelationship<DeepExcludeMaybe<{ __typename: 'C' } & C>>, Required<T>> => {
    const relationshipsToOmit: Set<string> = new Set(_relationshipsToOmit);
    relationshipsToOmit.add('C');
    return {
        __typename: 'C',
        b: overrides && overrides.hasOwnProperty('b') ? overrides.b! : relationshipsToOmit.has('B') ? {} as B : fakeB({}, relationshipsToOmit),
        field3: overrides && overrides.hasOwnProperty('field3') ? overrides.field3! : casual.integer(0, 9999),
    } as any;
};

export const seedMocks = (seed: number) => casual.seed(seed);
