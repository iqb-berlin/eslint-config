import { sharedValue } from '@shared/value';

export const value = sharedValue;
export const identity: (input: number) => number = input => input;
export const object = { z: 1, a: 2 };

export function throwValue(): never {
  const invalidError = 'invalid';
  throw invalidError;
}

export interface EmptyInterface {}
export type EmptyObject = {};

export type Wrapper = String;
export type UnsafeFunction = Function;
export type NamedTuple = [label:string];
