import { AddressCanonicalizer } from './address.util';
import { BadRequestException } from '@nestjs/common';

describe('AddressCanonicalizer', () => {
  describe('canonicalize and validate', () => {
    it('normalizes uppercase and trims whitespace', () => {
      expect(AddressCanonicalizer.validateAndCanonicalize('  Tidepool.ZZ  ')).toBe('tidepool.zz');
      expect(AddressCanonicalizer.validateAndCanonicalize('NEWS.ZZ/')).toBe('news.zz');
    });

    it('strips web protocol prefixes', () => {
      expect(AddressCanonicalizer.validateAndCanonicalize('http://tidepool.zz')).toBe('tidepool.zz');
      expect(AddressCanonicalizer.validateAndCanonicalize('https://blog-hub.zz/')).toBe('blog-hub.zz');
    });

    it('automatically adds .zz if single word entered', () => {
      expect(AddressCanonicalizer.validateAndCanonicalize('explorer')).toBe('explorer.zz');
    });

    it('supports hyphens and subdomains', () => {
      expect(AddressCanonicalizer.validateAndCanonicalize('sub.deep-sea.zz')).toBe('sub.deep-sea.zz');
    });

    it('rejects invalid characters, spaces, and non-.zz domains', () => {
      expect(() => AddressCanonicalizer.validateAndCanonicalize('google.com')).toThrow(BadRequestException);
      expect(() => AddressCanonicalizer.validateAndCanonicalize('hello world.zz')).toThrow(BadRequestException);
      expect(() => AddressCanonicalizer.validateAndCanonicalize('bad$site.zz')).toThrow(BadRequestException);
      expect(() => AddressCanonicalizer.validateAndCanonicalize('')).toThrow(BadRequestException);
    });
  });
});

