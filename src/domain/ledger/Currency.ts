export interface CurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
  exchangeRateToBase: number;
}

export class CurrencyManager {
  private static currencies: Map<string, CurrencyConfig> = new Map([
    ["EGP", { code: "EGP", symbol: "ج.م", decimals: 2, exchangeRateToBase: 0.02 }],
    ["USD", { code: "USD", symbol: "$", decimals: 2, exchangeRateToBase: 1.0 }],
    ["SAR", { code: "SAR", symbol: "ر.س", decimals: 2, exchangeRateToBase: 0.27 }],
  ]);

  static getCurrency(code: string): CurrencyConfig {
    return this.currencies.get(code) || { code, symbol: code, decimals: 2, exchangeRateToBase: 1 };
  }
}
