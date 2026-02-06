/**
 * Construction measurement units for products (Ordered vs Received reconciliation).
 */

export const MEASUREMENT_UNITS = [
  'kg',   // Kilogram
  'ton',  // Ton
  'litre',// Litre
  'adet', // Piece/Unit
  'm',    // Meter
  'm²',   // Square meter
  'm³',   // Cubic meter
  'torba',// Bag
  'paket',// Pack
  'kutu', // Box
  'rulo', // Roll
] as const;

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number];

export function isMeasurementUnit(s: string): s is MeasurementUnit {
  return (MEASUREMENT_UNITS as readonly string[]).includes(s);
}
