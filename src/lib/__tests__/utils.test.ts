import { describe, it, expect } from 'vitest';
import { 
  cn, 
  formatPrice, 
  generateBookingNumber, 
  calculateDays,
  isValidEmail,
  isValidPhone,
  isValidDNI,
  isValidNIE,
  isValidPlate
} from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('merges tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });
  });

  describe('formatPrice', () => {
    it('formats price correctly', () => {
      expect(formatPrice(100)).toContain('100');
      expect(formatPrice(100)).toContain('€');
    });

    it('handles decimals', () => {
      expect(formatPrice(99.99)).toContain('99,99');
    });

    it('handles zero', () => {
      expect(formatPrice(0)).toContain('0');
    });

    it('handles large numbers', () => {
      expect(formatPrice(10000)).toContain('10');
    });
  });

  describe('generateBookingNumber', () => {
    it('generates correct format', () => {
      const number = generateBookingNumber();
      expect(number).toMatch(/^ALK-\d{4}-\d{4,}$/);
    });

    it('includes current year', () => {
      const number = generateBookingNumber();
      const year = new Date().getFullYear().toString();
      expect(number).toContain(year);
    });
  });

  describe('calculateDays', () => {
    it('calculates days correctly', () => {
      const days = calculateDays('2024-01-01', '2024-01-05');
      expect(days).toBe(4);
    });

    it('returns minimum 1 day', () => {
      const days = calculateDays('2024-01-01', '2024-01-01');
      expect(days).toBe(1);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates correct phones', () => {
      expect(isValidPhone('+34600000000')).toBe(true);
      expect(isValidPhone('600000000')).toBe(true);
      expect(isValidPhone('+34 600 000 000')).toBe(true);
    });

    it('rejects invalid phones', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });

  describe('isValidDNI', () => {
    it('validates correct DNI', () => {
      expect(isValidDNI('12345678A')).toBe(true);
      expect(isValidDNI('87654321Z')).toBe(true);
    });

    it('rejects invalid DNI', () => {
      expect(isValidDNI('1234567A')).toBe(false);
      expect(isValidDNI('123456789')).toBe(false);
    });
  });

  describe('isValidNIE', () => {
    it('validates correct NIE', () => {
      expect(isValidNIE('X1234567A')).toBe(true);
      expect(isValidNIE('Y8765432B')).toBe(true);
    });

    it('rejects invalid NIE', () => {
      expect(isValidNIE('12345678A')).toBe(false);
      expect(isValidNIE('X123456')).toBe(false);
    });
  });

  describe('isValidPlate', () => {
    it('validates correct plates', () => {
      expect(isValidPlate('1234ABC')).toBe(true);
      expect(isValidPlate('AB1234CD')).toBe(true);
    });

    it('rejects invalid plates', () => {
      expect(isValidPlate('123ABC')).toBe(false);
      expect(isValidPlate('ABC123')).toBe(false);
    });
  });
});
