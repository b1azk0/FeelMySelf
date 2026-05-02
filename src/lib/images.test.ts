import { describe, it, expect } from 'vitest';
import { resolveImageUrl } from './images';

describe('resolveImageUrl', () => {
  it('returns absolute URLs unchanged', () => {
    expect(resolveImageUrl('https://example.com/foo.jpg')).toBe('https://example.com/foo.jpg');
  });

  it('proxies wp-content/uploads paths through www.feelmyself.pl', () => {
    expect(resolveImageUrl('/wp-content/uploads/2024/img.jpg'))
      .toBe('https://www.feelmyself.pl/wp-content/uploads/2024/img.jpg');
  });

  it('handles wp-content/uploads paths without leading slash', () => {
    expect(resolveImageUrl('wp-content/uploads/2024/img.jpg'))
      .toBe('https://www.feelmyself.pl/wp-content/uploads/2024/img.jpg');
  });

  it('preserves already-absolute www.feelmyself.pl URLs', () => {
    expect(resolveImageUrl('https://www.feelmyself.pl/wp-content/uploads/img.jpg'))
      .toBe('https://www.feelmyself.pl/wp-content/uploads/img.jpg');
  });

  it('returns site-relative paths for non-uploads paths unchanged', () => {
    expect(resolveImageUrl('/images/local.jpg')).toBe('/images/local.jpg');
  });

  it('handles empty string by returning it unchanged', () => {
    expect(resolveImageUrl('')).toBe('');
  });
});
