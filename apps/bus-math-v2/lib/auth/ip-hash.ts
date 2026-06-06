import { createHash } from 'crypto';

/**
 * Hashes ip address
 * @param ip - IP address
 * @returns True if the condition is met
 */
export function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}
