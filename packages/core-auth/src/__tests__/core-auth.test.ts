import { describe, it, expect } from 'vitest';
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  PASSWORD_HASH_ITERATIONS,
  PASSWORD_ALPHABET,
  getAuthJwtSecret,
  signSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
  generateRandomPassword,
  generatePasswordSalt,
} from '../index.js';

describe('core-auth constants', () => {
  it('exports session cookie name', () => {
    expect(SESSION_COOKIE_NAME).toBe('bm_session');
  });

  it('exports session TTL in seconds', () => {
    expect(SESSION_TTL_SECONDS).toBe(12 * 60 * 60);
  });

  it('exports password hash iterations', () => {
    expect(PASSWORD_HASH_ITERATIONS).toBe(120000);
  });

  it('exports unambiguous password alphabet', () => {
    expect(PASSWORD_ALPHABET).not.toContain('O');
    expect(PASSWORD_ALPHABET).not.toContain('0');
    expect(PASSWORD_ALPHABET).not.toContain('I');
    expect(PASSWORD_ALPHABET).not.toContain('l');
    expect(PASSWORD_ALPHABET).not.toContain('1');
  });
});

describe('getAuthJwtSecret', () => {
  it('returns env secret when set', () => {
    const secret = getAuthJwtSecret();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(0);
  });
});

describe('session token signing and verification', () => {
  const TEST_SECRET = 'test-secret-key-for-unit-tests';

  it('signs and verifies a valid session token', async () => {
    const input = {
      sub: 'user-123',
      username: 'testuser',
      role: 'student' as const,
    };

    const token = await signSessionToken(input, TEST_SECRET);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const claims = await verifySessionToken(token, TEST_SECRET);
    expect(claims).not.toBeNull();
    expect(claims?.sub).toBe('user-123');
    expect(claims?.username).toBe('testuser');
    expect(claims?.role).toBe('student');
  });

  it('rejects tampered tokens', async () => {
    const input = {
      sub: 'user-123',
      username: 'testuser',
      role: 'student' as const,
    };

    const token = await signSessionToken(input, TEST_SECRET);
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    const claims = await verifySessionToken(tamperedToken, TEST_SECRET);
    expect(claims).toBeNull();
  });

  it('rejects tokens with wrong secret', async () => {
    const input = {
      sub: 'user-123',
      username: 'testuser',
      role: 'teacher' as const,
    };

    const token = await signSessionToken(input, TEST_SECRET);
    const claims = await verifySessionToken(token, 'wrong-secret');
    expect(claims).toBeNull();
  });

  it('rejects malformed tokens', async () => {
    expect(await verifySessionToken('not-a-jwt', TEST_SECRET)).toBeNull();
    expect(await verifySessionToken('only.two', TEST_SECRET)).toBeNull();
    expect(await verifySessionToken('', TEST_SECRET)).toBeNull();
  });

  it('rejects expired tokens', async () => {
    const input = {
      sub: 'user-123',
      username: 'testuser',
      role: 'admin' as const,
    };

    const token = await signSessionToken(input, TEST_SECRET, -1);
    const claims = await verifySessionToken(token, TEST_SECRET);
    expect(claims).toBeNull();
  });
});

describe('password hashing', () => {
  it('hashes and verifies a valid password', async () => {
    const password = 'testPassword123';
    const salt = generatePasswordSalt();
    const iterations = 1000;

    const hash = await hashPassword(password, salt, iterations);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);

    const isValid = await verifyPassword(password, { salt, iterations, passwordHash: hash });
    expect(isValid).toBe(true);
  });

  it('rejects incorrect passwords', async () => {
    const password = 'correctPassword';
    const wrongPassword = 'wrongPassword';
    const salt = generatePasswordSalt();
    const iterations = 1000;

    const hash = await hashPassword(password, salt, iterations);
    const isValid = await verifyPassword(wrongPassword, { salt, iterations, passwordHash: hash });
    expect(isValid).toBe(false);
  });
});

describe('random password generation', () => {
  it('generates passwords of specified length', () => {
    const pass16 = generateRandomPassword(16);
    expect(pass16.length).toBe(16);

    const pass8 = generateRandomPassword(8);
    expect(pass8.length).toBe(8);
  });

  it('generates passwords with only allowed characters', () => {
    const password = generateRandomPassword(50);
    for (const char of password) {
      expect(PASSWORD_ALPHABET).toContain(char);
    }
  });

  it('generates unique passwords', () => {
    const passwords = new Set(Array.from({ length: 100 }, () => generateRandomPassword(16)));
    expect(passwords.size).toBe(100);
  });
});

describe('salt generation', () => {
  it('generates salts of specified byte length', () => {
    const salt16 = generatePasswordSalt(16);
    const salt32 = generatePasswordSalt(32);

    expect(salt16.length).toBeGreaterThan(0);
    expect(salt32.length).toBeGreaterThan(salt16.length);
  });

  it('generates unique salts', () => {
    const salts = new Set(Array.from({ length: 100 }, () => generatePasswordSalt()));
    expect(salts.size).toBe(100);
  });
});