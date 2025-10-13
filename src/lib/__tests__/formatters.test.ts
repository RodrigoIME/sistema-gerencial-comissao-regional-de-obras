import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('deve formatar valor monetário', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234,56');
    });

    it('deve retornar "-" para null', () => {
      expect(formatCurrency(null)).toBe('-');
    });

    it('deve retornar "-" para undefined', () => {
      expect(formatCurrency(undefined)).toBe('-');
    });

    it('deve formatar zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
    });

    it('deve formatar valores negativos', () => {
      const result = formatCurrency(-1234.56);
      expect(result).toContain('-');
      expect(result).toContain('1.234,56');
    });
  });
});
