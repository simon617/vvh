"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

interface SettingsFormProps {
  initial: { site_name: string; ga4_tracking_id: string };
  logoPath?: string;
}

/**
 * Admin settings page (deliverable 2B.10): site name + GA4 tracking ID are
 * GLOBAL settings (locale = NULL) saved via PUT /api/settings. Logo upload
 * (2B.7) posts to /api/logo.
 */
export default function SettingsForm({ initial, logoPath }: SettingsFormProps) {
  const [siteName, setSiteName] = useState(initial.site_name);
  const [ga4, setGa4] = useState(initial.ga4_tracking_id);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [logo, setLogo] = useState(logoPath ?? "/logo.svg");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_name: siteName, ga4_tracking_id: ga4 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.error ?? "Save failed");
        return;
      }
      setMessage("Saved");
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div>
        <label
          htmlFor="site-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Site name
        </label>
        <input
          id="site-name"
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="ga4-id"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          GA4 Tracking ID
        </label>
        <input
          id="ga4-id"
          type="text"
          value={ga4}
          onChange={(e) => setGa4(e.target.value)}
          placeholder="G-XXXXXXXXXX"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo
        </label>
        <ImageUploader
          current={logo}
          onChange={(path) => { setLogo(path); setMessage("Logo uploaded"); }}
          endpoint="/api/logo"
          label="Upload logo"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          Save settings
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    </form>
  );
}