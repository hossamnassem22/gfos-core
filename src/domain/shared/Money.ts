export type Money = bigint; // Minor units (e.g., cents)
export const toMinorUnits = (amount: number): Money => BigInt(Math.round(amount * 100));
