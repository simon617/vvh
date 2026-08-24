"use client";

import { useRef, useState } from "react";

export const ALLOWED_IMAGE_EXTENSIONS_CLIENT = [
  "jpg",
  "jpeg",
  "png",
  "svg",
  "webp",
] as const;

export const CLIENT_MAX_FILE_SIZE = 5242880; // 5 MB — server re-validates

export type ImageFileValidation =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Client-side file validation (TD-14): the server enforces the same rules.
 * Kept Node-agnostic so it runs in the browser.
 */
export function validateImageFileClient(
  name: string,
  size: number
): ImageFileValidation {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!(ALLOWED_IMAGE_EXTENSIONS_CLIENT as readonly string[]).includes(ext)) {
    return {
      ok: false,
      error: "Only image files (jpg, jpeg, png, svg, webp) are allowed.",
    };
  }
  if (size > CLIENT_MAX_FILE_SIZE) {
    return {
      ok: false,
      error: "File size must be 5MB or less.",
    };
  }
  return { ok: true };
}

interface ImageUploaderProps {
  current?: string | null;
  onChange: (path: string) => void;
  endpoint?: string;
  label?: string;
}

/**
 * Header/logo image uploader with client-side validation + preview.
 * On success it posts to `<endpoint>` (default /api/upload/image) and passes
 * the returned RELATIVE path up via onChange.
 */
export default function ImageUploader({
  current = null,
  onChange,
  endpoint = "/api/upload/image",
  label = "Upload image",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setError(null);

    const validation = validateImageFileClient(file.name, file.size);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(endpoint, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      const path: string | undefined = data.path;
      if (!path) {
        setError("Upload failed: no file path returned");
        return;
      }
      setPreview(path);
      onChange(path);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.svg,.webp"
          data-testid="image-upload-input"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : label}
        </button>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Upload preview"
            className="h-16 w-auto border border-border rounded"
          />
        )}
      </div>
      {error && <p className="mt-1 text-sm text-secondary">{error}</p>}
    </div>
  );
}