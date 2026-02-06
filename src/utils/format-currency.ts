export const formatCurrency = (
  amount: number | null | undefined,
  currencyCode = 'USD',
  locale?: string,
): string => {
  if (amount == null || Number.isNaN(amount)) {
    return '\u2014';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
};
