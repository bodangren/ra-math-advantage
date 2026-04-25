"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-surface animate-pulse" />;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/auth/login" className="btn-secondary text-sm">
          Sign in
        </Link>
      </div>
    );
  }

  const displayName = profile?.display_name || "User";

  return (
    <div className="flex items-center gap-3">
      <span className="text-secondary-text text-sm">{displayName}</span>
      <button
        onClick={handleLogout}
        className="text-muted-text text-sm hover:text-primary-text transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
