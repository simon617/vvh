"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PageContent } from "@/lib/page-content";
import LocaleTabs from "./LocaleTabs";
import TipTapEditor from "./TipTapEditor";
import ImageUploader from "./ImageUploader";

type Locale = "en" | "zh";

interface PageDraft {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  contentHtml: string;
  breadcrumbLabel: string;
  isPublished: boolean;
}

interface PageEditorProps {
  slug: string;
  initialEn?: PageContent | null;
  initialZh?: PageContent | null;
}

function toDraft(row?: PageContent | null): PageDraft {
  return {
    title: row?.title ?? "",
    metaTitle: row?.metaTitle ?? "",
    metaDescription: row?.metaDescription ?? "",
    heroImage: row?.heroImage ?? "",
    contentHtml: row?.contentHtml ?? "",
    breadcrumbLabel: row?.breadcrumbLabel ?? "",
    isPublished: row?.isPublished ?? true,
  };
}

/**
 * Bilingual page editor (deliverables 2B.2, 2B.5, 2B.6).
 * EN/ZH are INDEPENDENT rows in page_contents: each tab edits one locale with
 * its own title, SEO fields, hero image, WYSIWYG body and publish toggle
 * (Decision D8). Manual Save (TD-16) writes the ACTIVE locale via
 * PUT /api/pages/[slug]; switching tabs with unsaved changes is guarded.
 */
export default function PageEditor({
  slug,
  initialEn,
  initialZh,
}: PageEditorProps) {
  const searchParams = useSearchParams();
  const active: Locale = searchParams.get("tab") === "zh" ? "zh" : "en";

  const [drafts, setDrafts] = useState<Record<Locale, PageDraft>>({
    en: toDraft(initialEn),
    zh: toDraft(initialZh),
  });
  const [dirty, setDirty] = useState<Record<Locale, boolean>>({
    en: false,
    zh: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const draft = drafts[active];

  function update(patch: Partial<PageDraft>) {
    setDrafts((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
    setDirty((prev) => ({ ...prev, [active]: true }));
    setMessage(null);
  }

  function handleTabChange() {
    if (dirty[active]) {
      return window.confirm(
        "You have unsaved changes. Switch tabs anyway?"
      );
    }
    return true;
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: active, ...draft }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setMessage(data?.error ?? "Save failed");
        return;
      }
      setDirty((prev) => ({ ...prev, [active]: false }));
      setMessage("Saved");
    } catch {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <LocaleTabs onBeforeChange={handleTabChange} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title ({active.toUpperCase()})
            </label>
            <input
              id="title"
              type="text"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Content</label>
            <TipTapEditor
              value={draft.contentHtml}
              onChange={(html) => update({ contentHtml: html })}
              placeholder="Enter page content..."
            />
          </div>
        </div>

        {/* Right column: image + SEO + publish */}
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Header image</label>
            <ImageUploader
              current={draft.heroImage}
              onChange={(path) => update({ heroImage: path })}
              label="Upload header image"
            />
          </div>

          <div>
            <label htmlFor="metaTitle" className={labelClass}>
              Meta title
            </label>
            <input
              id="metaTitle"
              type="text"
              value={draft.metaTitle}
              onChange={(e) => update({ metaTitle: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="metaDescription" className={labelClass}>
              Meta description
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={draft.metaDescription}
              onChange={(e) => update({ metaDescription: e.target.value })}
              className={inputClass}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              data-testid={`publish-${active}`}
              checked={draft.isPublished}
              onChange={(e) => update({ isPublished: e.target.checked })}
            />
            Published ({active.toUpperCase()})
          </label>

          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              Save
            </button>
            {dirty[active] && (
              <span className="text-sm text-secondary">Unsaved changes</span>
            )}
            {message && <span className="text-sm text-gray-600">{message}</span>}
          </div>

          <p className="text-xs text-gray-400">
            {active.toUpperCase()} content is a separate row in the database —
            publishing one language never affects the other.
          </p>
        </div>
      </div>
    </div>
  );
}