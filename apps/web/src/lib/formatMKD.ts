/**
 * Format number as MKD (Makedon Denarı) for display.
 * Uses Turkish locale for number formatting (e.g. 1.234,56).
 */
const mkdFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'MKD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMKD(value: number): string {
  return mkdFormatter.format(value);
}

/** Format number with MKD suffix, no symbol (e.g. "120.000,00 MKD") */
export function formatMKDPlain(value: number): string {
  const num = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${num} MKD`;
}
