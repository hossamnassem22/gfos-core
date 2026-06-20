export type Money = bigint; // Minor units only (cents)

export const Money = {
  fromNumber(amount: number): bigint {
    return BigInt(Math.round(amount * 100));
  },

  add(a: bigint, b: bigint): bigint {
    return a + b;
  },

  subtract(a: bigint, b: bigint): bigint {
    return a - b;
  }
};
