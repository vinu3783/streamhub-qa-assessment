const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeCurrency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number): string => currency.format(value);

export const formatWholeCurrency = (value: number): string => wholeCurrency.format(value);

export const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`;
