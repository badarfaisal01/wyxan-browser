import { BadRequestException } from '@nestjs/common';

export class AddressCanonicalizer {
  // Matches valid .zz internal domains, e.g. tidepool.zz, news-daily.zz, blog.sub.zz
  private static readonly ZZ_DOMAIN_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.zz$/;

  /**
   * Normalizes an address string to its canonical .zz format:
   * - Trims whitespace
   * - Strips leading http://, https://, or // schemes
   * - Strips trailing slashes
   * - Converts to lowercase
   * - Automatically appends .zz if omitted by the user (e.g. "tidepool" -> "tidepool.zz")
   */
  static canonicalize(rawAddress: string): string {
    if (!rawAddress || typeof rawAddress !== 'string') {
      throw new BadRequestException('Address must be a non-empty string');
    }

    let cleaned = rawAddress.trim().toLowerCase();

    // Strip protocols if user pasted them
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/^\/\//, '');

    // Strip trailing slashes
    cleaned = cleaned.replace(/\/+$/, '');

    // If no TLD provided, append .zz
    if (!cleaned.includes('.')) {
      cleaned = `${cleaned}.zz`;
    }

    return cleaned;
  }

  /**
   * Validates whether an address conforms strictly to the canonical .zz specification.
   */
  static isValid(address: string): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }
    return this.ZZ_DOMAIN_REGEX.test(address);
  }

  /**
   * Validates and returns the canonical address, throwing BadRequestException if invalid.
   */
  static validateAndCanonicalize(rawAddress: string): string {
    const canonical = this.canonicalize(rawAddress);
    if (!this.isValid(canonical)) {
      throw new BadRequestException(
        `Invalid address format: "${rawAddress}". Addresses must end with .zz and contain only alphanumeric characters and hyphens.`,
      );
    }
    return canonical;
  }
}

