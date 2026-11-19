import { describe, expect, it } from 'vitest';
import { parseHashRoute } from '../router';

describe('hash router', () => {
  it('resolves known routes and falls back to home', () => {
    expect(parseHashRoute('')).toBe('home');
    expect(parseHashRoute('#/')).toBe('home');
    expect(parseHashRoute('#/guida')).toBe('guida');
    expect(parseHashRoute('#/sessione')).toBe('sessione');
    expect(parseHashRoute('#/statistiche')).toBe('statistiche');
    expect(parseHashRoute('#/impostazioni')).toBe('impostazioni');
    expect(parseHashRoute('#/sconosciuta')).toBe('home');
  });
});
