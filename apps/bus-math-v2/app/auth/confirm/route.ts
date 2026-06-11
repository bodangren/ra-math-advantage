import { redirect } from "next/navigation";

/**
 * Handles email confirmation callback by redirecting to the login page.
 *
 * @returns A redirect to /auth/login with a message that email confirmation
 *   is not used in this system.
 */
export async function GET() {
  redirect("/auth/login?message=Email confirmation is not used in this system");
}
