"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

interface AdminNavProps {
  username: string;
  locale: string;
}

export default function AdminNav({ username, locale }: AdminNavProps) {
  const t = useTranslations("admin");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors — still navigate away
    } finally {
      // Full page navigation guarantees the session cookie is cleared
      // and the login page renders fresh. Client-side router.push can
      // occasionally leave a stale admin layout on screen.
      window.location.assign(`/${locale}/admin/login`);
    }
  }

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <a
              href={`/${locale}/admin`}
              className="text-lg font-semibold text-white hover:text-accent transition-colors"
            >
              VVH CMS
            </a>
            <div className="hidden md:flex space-x-4 ml-8">
              <a
                href={`/${locale}/admin`}
                className="text-sm text-white hover:text-accent transition-colors"
              >
                {t("dashboard")}
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/80">{username}</span>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm px-3 py-1 bg-secondary text-white rounded hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {loggingOut ? "..." : t("logout")}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}