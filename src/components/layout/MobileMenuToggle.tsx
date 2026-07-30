"use client";

import { useState } from "react";
import MobileMenu from "./MobileMenu";

interface MobileMenuToggleProps {
  locale: string;
}

export default function MobileMenuToggle({ locale }: MobileMenuToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} />
    </>
  );
}