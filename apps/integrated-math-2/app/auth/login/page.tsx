"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(username, password);
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      if (
        !response.ok ||
        session.authenticated !== true ||
        !["student", "teacher", "admin"].includes(session.profile?.role)
      ) {
        throw new Error("Could not verify your session. Sign in again.");
      }
      const fallback =
        session.profile?.role === "student" ? "/student/dashboard" : "/teacher/dashboard";
      const requested = new URLSearchParams(window.location.search).get("redirect");
      router.push(
        requested?.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\")
          ? requested
          : fallback,
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-primary-text mb-2 font-display"
            style={{ fontSize: "32px", fontWeight: 700 }}
          >
            Sign In
          </h1>
          <p className="text-secondary-text">Sign in to Integrated Math 2</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="bg-error/10 border border-error/30 rounded-md p-3 text-sm text-error"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm text-secondary-text mb-1"
              style={{ fontWeight: 500 }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full"
              required
              maxLength={80}
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-secondary-text mb-1"
              style={{ fontWeight: 500 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-muted-text text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-accent hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
