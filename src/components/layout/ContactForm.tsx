"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  textarea?: boolean;
}

function Field({ id, label, value, onChange, error, textarea }: FieldProps) {
  const baseClasses =
    "mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none min-h-[44px]";
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={id === "email" ? "email" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        />
      )}
      {error && (
        <p role="alert" className="mt-1 text-sm text-secondary">
          {error}
        </p>
      )}
    </div>
  );
}

/** Honeypot field name — hidden from humans, tempting to bots (TD-24). */
const HONEYPOT_FIELD = "company_website";

type SendState = "idle" | "sending" | "success" | "error";

/**
 * Contact form with client-side validation + SMTP submission (Phase 3).
 * On submit, POSTs the four fields to /api/contact/send and reflects
 * success/failure locally. A filled honeypot is silently "accepted"
 * without calling the API (no DB storage — decision D7).
 */
export default function ContactForm() {
  const t = useTranslations("contact");
  const [values, setValues] = useState({
    name: "",
    subject: "",
    email: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SendState>("idle");

  const set = (field: keyof typeof values) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot filled → silently pretend success, send nothing. Checked BEFORE
    // validation so bots learn nothing about the form's real rules (TD-24).
    if (honeypot.trim() !== "") {
      setState("success");
      return;
    }

    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t("errName");
    if (!values.subject.trim()) next.subject = t("errSubject");
    if (!values.email.trim()) next.email = t("errEmail");
    if (!values.message.trim()) next.message = t("errMessage");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setState("idle");
      return;
    }

    setState("sending");
    try {
      const res = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: honeypot }),
      });
      if (res.ok) {
        setState("success");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const handleReset = () => {
    setValues({ name: "", subject: "", email: "", message: "" });
    setHoneypot("");
    setErrors({});
    setState("idle");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="mb-6 text-sm text-gray-600">{t("intro")}</p>
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot — invisible to humans, filled by bots (TD-24). */}
        <input
          type="text"
          name={HONEYPOT_FIELD}
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <Field
          id="name"
          label={`${t("name")} *`}
          value={values.name}
          onChange={set("name")}
          error={errors.name}
        />
        <Field
          id="subject"
          label={`${t("subject")} *`}
          value={values.subject}
          onChange={set("subject")}
          error={errors.subject}
        />
        <Field
          id="email"
          label={`${t("email")} *`}
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Field
          id="message"
          label={`${t("message")} *`}
          value={values.message}
          onChange={set("message")}
          error={errors.message}
          textarea
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={state === "sending"}
            className="min-h-[44px] rounded bg-secondary px-6 py-2 text-sm font-semibold text-white hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {state === "sending" ? t("sending") : t("submit")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] rounded border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("reset")}
          </button>
        </div>
        {state === "success" && (
          <p
            role="status"
            className="mt-4 rounded bg-background-light p-3 text-sm text-primary"
          >
            {t("success")}
          </p>
        )}
        {state === "error" && (
          <p
            role="alert"
            className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700"
          >
            {t("error")}
          </p>
        )}
      </form>
    </div>
  );
}
