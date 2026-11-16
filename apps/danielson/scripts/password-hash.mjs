import { randomBytes, webcrypto } from 'node:crypto';

export const PASSWORD_HASH_ITERATIONS = 120_000;

/** Create the PBKDF2 credential payload used by the Danielson seed scripts. */
export async function createPasswordCredential(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('password is required');
  }
  const passwordSalt = randomBytes(16).toString('base64url');
  const key = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await webcrypto.subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-256',
    salt: new TextEncoder().encode(passwordSalt),
    iterations: PASSWORD_HASH_ITERATIONS,
  }, key, 256);
  return {
    passwordHash: Buffer.from(derived).toString('base64url'),
    passwordSalt,
    passwordHashIterations: PASSWORD_HASH_ITERATIONS,
  };
}
