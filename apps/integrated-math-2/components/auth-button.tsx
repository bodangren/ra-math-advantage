import Link from "next/link";
import { getServerSessionClaims } from "@/lib/auth/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const claims = await getServerSessionClaims();

  return claims ? (
    <div className="flex items-center gap-4 text-secondary-text">
      <span>{claims.username}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Link href="/auth/login" className="btn-secondary text-sm">
        Sign in
      </Link>
    </div>
  );
}
