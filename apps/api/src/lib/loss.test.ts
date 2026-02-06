/**
 * Tests for loss computation (reconciliation business logic)
 */

import { describe, it, expect } from 'vitest';

function computeItem(
  orderedQty: number,
  receivedQty: number,
  price: number
): { missingQty: number; lossValue: number; status: 'COMPLETE' | 'MISSING' | 'EXCESS' } {
  const missingQty = Math.max(orderedQty - receivedQty, 0);
  const lossValue = missingQty * price;
  const status =
    missingQty > 0 ? 'MISSING' : receivedQty > orderedQty ? 'EXCESS' : 'COMPLETE';
  return { missingQty, lossValue, status };
}

describe('loss computation', () => {
  it('computes missing qty as max(ordered - received, 0)', () => {
    expect(computeItem(10, 8, 5).missingQty).toBe(2);
    expect(computeItem(10, 10, 5).missingQty).toBe(0);
    expect(computeItem(10, 12, 5).missingQty).toBe(0);
    expect(computeItem(10, 0, 5).missingQty).toBe(10);
  });

  it('computes lossValue as missingQty * price', () => {
    expect(computeItem(10, 8, 5).lossValue).toBe(10);
    expect(computeItem(10, 10, 5).lossValue).toBe(0);
    expect(computeItem(3, 0, 100).lossValue).toBe(300);
  });

  it('sets status MISSING when missingQty > 0', () => {
    expect(computeItem(10, 8, 5).status).toBe('MISSING');
  });

  it('sets status COMPLETE when ordered equals received', () => {
    expect(computeItem(10, 10, 5).status).toBe('COMPLETE');
  });

  it('sets status EXCESS when received > ordered', () => {
    expect(computeItem(10, 12, 5).status).toBe('EXCESS');
  });

  it('totalLossValue is sum of item loss values', () => {
    const items = [
      computeItem(10, 8, 5),
      computeItem(5, 5, 10),
      computeItem(2, 0, 100),
    ];
    const total = items.reduce((s, i) => s + i.lossValue, 0);
    expect(total).toBe(10 + 0 + 200);
  });
});
