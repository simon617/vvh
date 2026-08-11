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

/**
 * Static contact form UI for Phase 2A.
 * Client-side validation only; no backend submission until Phase 3.
 */
export default function ContactForm() {
  const t = useTranslations("contact");
  const [values, setValues] = useState({
    name: "",
    subject: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accepted, setAccepted] = useState(false);

  const set = (field: keyof typeof values) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = t("errName");
    if (!values.subject.trim()) next.subject = t("errSubject");
    if (!values.email.trim()) next.email = t("errEmail");
    if (!values.message.trim()) next.message = t("errMessage");
    setErrors(next);
    setAccepted(Object.keys(next).length === 0);
  };

  const handleReset = () => {
    setValues({ name: "", subject: "", email: "", message: "" });
    setErrors({});
    setAccepted(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <p className="mb-6 text-sm text-gray-600">{t("intro")}</p>
      <form onSubmit={handleSubmit} noValidate>
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
            className="min-h-[44px] rounded bg-secondary px-6 py-2 text-sm font-semibold text-white hover:bg-secondary/90 transition-colors"
          >
            {t("submit")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] rounded border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t("reset")}
          </button>
        </div>
        {accepted && (
          <p role="status" className="mt-4 rounded bg-background-light p-3 text-sm text-primary">
            {t("info")}
          </p>
        )}
      </form>
    </div>
  );
}
