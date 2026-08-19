export async function hashIpAddress(address: string): Promise<string> {
  const bytes = new TextEncoder().encode(address.trim());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Buffer.from(digest).toString('base64url');
}
