/* @flow */

export type TEnvironment = {
  conversions: Array<TConversion>;
};

export type TValue = {
  num: number;
  units: TUnitSet;
};

export type TUnit = string;

export type TUnitSet = {
  [key: string]: number;
};

export type TConversion = {
  from: TUnit;
  to: TUnit;
  ratio: number;
}

export type TResolver = (
  identifier: string,
  args: [string]
) => TValue;
