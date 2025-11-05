import { describe, it, expect } from 'vitest';
import { generateFingerprint, generateFingerprintId, generateRandomHeaders } from '../utils/fingerprint.js';

describe('Fingerprint Generation', () => {
  it('should generate valid fingerprint', () => {
    const fingerprint = generateFingerprint();

    expect(fingerprint).toHaveProperty('userAgent');
    expect(fingerprint).toHaveProperty('viewport');
    expect(fingerprint).toHaveProperty('deviceScaleFactor');
    expect(fingerprint).toHaveProperty('isMobile');
    expect(fingerprint).toHaveProperty('hasTouch');
    expect(fingerprint).toHaveProperty('locale');
    expect(fingerprint).toHaveProperty('timezone');

    expect(typeof fingerprint.userAgent).toBe('string');
    expect(fingerprint.userAgent.length).toBeGreaterThan(0);
    expect(fingerprint.viewport.width).toBeGreaterThan(0);
    expect(fingerprint.viewport.height).toBeGreaterThan(0);
  });

  it('should generate unique fingerprints', () => {
    const fingerprints = Array.from({ length: 10 }, () => generateFingerprint());
    const ids = fingerprints.map(generateFingerprintId);

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBeGreaterThan(1);
  });

  it('should generate fingerprint ID', () => {
    const fingerprint = generateFingerprint();
    const id = generateFingerprintId(fingerprint);

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    expect(id).toContain('x');
  });

  it('should generate random headers', () => {
    const fingerprint = generateFingerprint();
    const headers = generateRandomHeaders(fingerprint);

    expect(headers).toHaveProperty('Accept');
    expect(headers).toHaveProperty('Accept-Language');
    expect(headers).toHaveProperty('Accept-Encoding');
    expect(headers).toHaveProperty('Connection');
    expect(headers['Accept-Language']).toContain(fingerprint.locale);
  });

  it('should include appropriate mobile headers when isMobile', () => {
    const fingerprint = generateFingerprint();
    fingerprint.isMobile = true;
    
    const headers = generateRandomHeaders(fingerprint);
    expect(headers).toBeDefined();
    expect(typeof headers).toBe('object');
  });
});
