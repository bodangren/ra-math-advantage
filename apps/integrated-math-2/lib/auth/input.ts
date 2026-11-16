export async function readCredentials(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { username, password } = body as Record<string, unknown>;
  if (
    typeof username !== "string" ||
    !username.trim() ||
    username.trim().length > 80 ||
    typeof password !== "string" ||
    !password ||
    password.length > 128
  )
    return null;
  return {
    username: username.trim(),
    password,
    body: body as Record<string, unknown>,
  };
}
