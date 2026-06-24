import { PASSWORD_ALPHABET } from './constants';

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface SessionClaims {
  sub: string;
  username: string;
  role: UserRole;
  organizationId?: string;
  iat: number;
  exp: number;
}

export interface SessionTokenInput {
  sub: string;
  username: string;
  role: UserRole;
  organizationId?: string;
}

export interface PasswordCredential {
  salt: string;
  iterations: number;
  passwordHash: string;
}

const encoder = new TextEncoder();

/**
 * Converts Uint8Array bytes to a Base64 string.
 * @param {Uint8Array} bytes - Byte array to encode
 * @returns {string} - Base64 encoded string
 */
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === 'function') {
    return btoa(binary);
  }

  return Buffer.from(binary, 'binary').toString('base64');
}

/**
 * Decodes a Base64 string back to Uint8Array bytes.
 * @param {string} value - Base64 string to decode
 * @returns {Uint8Array} - Decoded byte array
 */
function fromBase64(value: string): Uint8Array {
  const binary =
    typeof atob === 'function'
      ? atob(value)
      : Buffer.from(value, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * URL-safe Base64 encoding of bytes (no padding, -/_ replacement).
 * @param {Uint8Array} bytes - Byte array to encode
 * @returns {string} - URL-safe Base64 string
 */
function base64UrlEncodeBytes(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Decodes a URL-safe Base64 string back to bytes (adds padding).
 * @param {string} value - URL-safe Base64 string to decode
 * @returns {Uint8Array} - Decoded byte array
 */
function base64UrlDecodeToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return fromBase64(padded);
}

/**
 * Encodes a string to URL-safe Base64.
 * @param {string} value - String to encode
 * @returns {string} - URL-safe Base64 string
 */
function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(encoder.encode(value));
}

/**
 * Decodes a URL-safe Base64 string to a string.
 * @param {string} value - URL-safe Base64 string to decode
 * @returns {string} - Decoded string
 */
function base64UrlDecodeToString(value: string): string {
  const bytes = base64UrlDecodeToBytes(value);
  return new TextDecoder().decode(bytes);
}

/**
 * Computes HMAC-SHA256 signature of a value using a secret.
 * @param {string} value - String to sign
 * @param {string} secret - HMAC secret key
 * @returns {Promise<Uint8Array>} - Signature as Uint8Array
 */
async function hmacSign(value: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return new Uint8Array(signature);
}

/**
 * Constant-time comparison to prevent timing attacks.
 * @param {Uint8Array} a - First byte array
 * @param {Uint8Array} b - Second byte array
 * @returns {boolean} - True if arrays are equal in constant time
 */
function timingSafeEquals(a: Uint8Array, b: Uint8Array): boolean {
  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i += 1) {
    result |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return result === 0;
}

/**
 * Creates a signed JWT session token with claims and TTL.
 * @param {SessionTokenInput} input - Session claims (sub, username, role, organizationId)
 * @param {string} secret - JWT signing secret
 * @param {number} ttlSeconds - Token time-to-live in seconds (default 12 hours)
 * @returns {Promise<string>} - Signed JWT token string
 */
export async function signSessionToken(
  input: SessionTokenInput,
  secret: string,
  ttlSeconds = 60 * 60 * 12,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    ...input,
    iat: now,
    exp: now + ttlSeconds,
  };

  const header = base64UrlEncodeString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncodeString(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  const signature = await hmacSign(signingInput, secret);
  return `${signingInput}.${base64UrlEncodeBytes(signature)}`;
}

/**
 * Verifies and decodes a JWT session token.
 * @param {string} token - JWT token to verify
 * @param {string} secret - JWT signing secret
 * @returns {Promise<SessionClaims | null>} - SessionClaims or null if invalid/expired
 */
export async function verifySessionToken(token: string, secret: string): Promise<SessionClaims | null> {
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [header, payload, signature] = segments;
  const signingInput = `${header}.${payload}`;
  const expectedSig = await hmacSign(signingInput, secret);
  const actualSig = base64UrlDecodeToBytes(signature);

  if (!timingSafeEquals(expectedSig, actualSig)) {
    return null;
  }

  let claims: SessionClaims;
  try {
    claims = JSON.parse(base64UrlDecodeToString(payload)) as SessionClaims;
  } catch {
    return null;
  }

  if (!claims?.sub || !claims?.username || !claims?.role || !claims?.exp || !claims?.iat) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (claims.exp <= now) {
    return null;
  }

  return claims;
}

/**
 * Hashes a password using PBKDF2 with the given salt and iterations.
 * @param {string} password - Plain text password
 * @param {string} salt - Password salt string
 * @param {number} iterations - PBKDF2 iteration count
 * @returns {Promise<string>} - Base64-encoded password hash
 */
export async function hashPassword(password: string, salt: string, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(salt),
      iterations,
    },
    keyMaterial,
    256,
  );

  return base64UrlEncodeBytes(new Uint8Array(derived));
}

/**
 * Verifies a password against a stored password credential.
 * @param {string} password - Plain text password to verify
 * @param {PasswordCredential} credential - Stored salt, iterations, and hash
 * @returns {Promise<boolean>} - True if password matches using constant-time comparison
 */
export async function verifyPassword(
  password: string,
  credential: PasswordCredential,
): Promise<boolean> {
  const candidate = await hashPassword(password, credential.salt, credential.iterations);
  const a = encoder.encode(candidate);
  const b = encoder.encode(credential.passwordHash);
  return timingSafeEquals(a, b);
}

/**
 * Generates a cryptographically random password from a secure alphabet.
 * @param {number} length - Password length (default 12)
 * @returns {string} - Random password string
 */
export function generateRandomPassword(length = 12): string {
  const maxByte = 256 - (256 % PASSWORD_ALPHABET.length);
  const result: string[] = [];
  while (result.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (const byte of bytes) {
      if (byte < maxByte && result.length < length) {
        result.push(PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]);
      }
    }
  }
  return result.join('');
}

/**
 * Generates a cryptographically random salt for password hashing.
 * @param {number} bytes - Salt byte length (default 16)
 * @returns {string} - Base64-encoded random salt
 */
export function generatePasswordSalt(bytes = 16): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return base64UrlEncodeBytes(values);
}