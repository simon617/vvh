"use client";

import { useState } from "react";

export interface Director {
  name: string;
  title: string;
  category: string;
  bio: string;
}

interface DirectorCardsProps {
  directors: Director[];
}

export default function DirectorCards({ directors }: DirectorCardsProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // Group directors by category
  const categories = directors.reduce<Record<string, Director[]>>(
    (acc, director) => {
      if (!acc[director.category]) {
        acc[director.category] = [];
      }
      acc[director.category].push(director);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, categoryDirectors]) => (
        <section key={category}>
          <h2 className="text-xl font-semibold text-primary mb-4">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryDirectors.map((director) => {
              const isExpanded = expanded.has(director.name);
              return (
                <div
                  key={director.name}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <button
                    type="button"
                    onClick={() => toggle(director.name)}
                    className="w-full text-left min-h-[44px]"
                    aria-expanded={isExpanded}
                  >
                    <div className="font-semibold text-primary">
                      {director.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {director.title}
                    </div>
                  </button>
                  {isExpanded && (
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                      {director.bio}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}