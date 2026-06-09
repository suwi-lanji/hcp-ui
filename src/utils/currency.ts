export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', locale: 'en-US' };

export function getRowCurrency(row: Record<string, unknown> | null | undefined): CurrencyInfo {
  const c = row?.__currency as CurrencyInfo | undefined;
  return c ?? DEFAULT_CURRENCY;
}

export function formatCurrency(value: unknown, rowOrCurrency?: Record<string, unknown> | CurrencyInfo | null): string {
  const num = Number(value);
  if (value === null || value === undefined || Number.isNaN(num)) return '-';

  let currency: CurrencyInfo;
  if (rowOrCurrency && 'code' in rowOrCurrency && 'symbol' in rowOrCurrency && 'locale' in rowOrCurrency) {
    currency = rowOrCurrency as CurrencyInfo;
  } else {
    currency = getRowCurrency(rowOrCurrency as Record<string, unknown> | null | undefined);
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency.symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
