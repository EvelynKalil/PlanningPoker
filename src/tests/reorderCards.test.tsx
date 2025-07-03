import { describe, it, expect } from 'vitest';
import { reorderCards } from '../utils/cards';

describe('reorderCards', () => {
  it('reordena tarjetas del índice 1 al índice 3', () => {
    const original = [0, 1, 3, 5, 8];
    const resultado = reorderCards(original, 1, 3);
    expect(resultado).toEqual([0, 3, 5, 1, 8]);
  });

  it('reordena tarjetas del índice 3 al índice 0', () => {
    const original = [0, 1, 3, 5, 8];
    const resultado = reorderCards(original, 3, 0);
    expect(resultado).toEqual([5, 0, 1, 3, 8]);
  });
});
  