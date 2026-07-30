"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminSetupPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSetup() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          // Admin exists and we're logged in, redirect to dashboard
          router.push("/en/admin");
          return;
        }
        // Check if admin exists at all
        const setupRes = await fetch("/api/auth/setup", { method: "HEAD" }).catch(() => null);
        if (setupRes?.status === 409) {
          // Admin exists but we're not logged in, redirect to login
          router.push("/en/admin/login");
          return;
        }
      } catch {
        // Continue showing setup form
      } finally {
        setChecking(false);
      }
    }
    checkSetup();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Setup failed");
        return;
      }

      setSuccess(t("setupSuccess"));
      setTimeout(() => {
        router.push("/en/admin/login");
      }, 2000);
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <p className="text-gray-500">{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">
          {t("setupTitle")}
        </h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          {t("setupDescription")}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("username")}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? t("common.loading") || "Loading..." : t("createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
}