"use client";

/**
 * components/CategoryBar.tsx
 *
 * Renders three buttons — Restaurants, Hotels, Hospitals.
 *
 * The active category is highlighted.  Clicking the same category again
 * re-runs the search (useful after panning the map).
 */

import { CATEGORIES, type PlaceCategory } from "@/lib/places";

interface CategoryBarProps {
  active: PlaceCategory | null;
  loading: boolean;
  onSelect: (type: PlaceCategory) => void;
}

export default function CategoryBar({
  active,
  loading,
  onSelect,
}: CategoryBarProps) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map(({ label, type }) => {
        const isActive = active === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={loading}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {loading && isActive ? "Searching…" : label}
          </button>
        );
      })}
    </div>
  );
}
