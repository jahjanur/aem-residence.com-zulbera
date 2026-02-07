/**
 * Format number as MKD (Makedon Denarı) for display.
 * Uses Turkish locale, no decimal places (e.g. 1.234 MKD).
 */
const mkdFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'MKD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMKD(value: number): string {
  return mkdFormatter.format(value);
}

/** Format number with MKD suffix (e.g. "120.000 MKD") */
export function formatMKDPlain(value: number): string {
  const num = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return `${num} MKD`;
}
