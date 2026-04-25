"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const logout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <button onClick={logout} className="btn-secondary text-sm">
      Logout
    </button>
  );
}
