"use client";

/**
 * components/PlaceList.tsx
 *
 * Displays nearby-search results as a scrollable list.
 *
 * Each card shows:
 *   • Place name
 *   • Address (formattedAddress)
 *   • Star rating (if available)
 *
 * Clicking a card calls `onSelect` so the parent can centre the map and
 * open the corresponding marker's InfoWindow.
 *
 * States
 * ──────
 * loading  — skeleton cards shown while the API request is in flight.
 * error    — styled error banner when the request fails.
 * empty    — two distinct messages:
 *              • No search yet  → "Select a category above to search."
 *              • Empty result   → "No places found nearby."
 */

import { type NearbyPlace } from "@/lib/places";

interface PlaceListProps {
  places: NearbyPlace[];
  loading: boolean;
  error: string | null;
  /** True once the user has triggered at least one search. */
  hasSearched: boolean;
  selectedPlaceId: string | null;
  onSelect: (placeId: string) => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-yellow-500 text-xs" aria-label={`${rating} stars`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
      <span className="text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

/** Animated placeholder cards shown while the API request is in flight. */
function SkeletonList() {
  return (
    <ol className="mt-3 space-y-2" aria-busy="true" aria-label="Loading places">
      {Array.from({ length: 5 }).map((_, i) => (
        <li
          key={i}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white animate-pulse"
        >
          <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-2.5 bg-gray-100 rounded w-full mb-1" />
          <div className="h-2.5 bg-gray-100 rounded w-1/3" />
        </li>
      ))}
    </ol>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PlaceList({
  places,
  loading,
  error,
  hasSearched,
  selectedPlaceId,
  onSelect,
}: PlaceListProps) {
  if (loading) {
    return <SkeletonList />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mt-3 px-3 py-2.5 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700"
      >
        <p className="font-medium">Search failed</p>
        <p className="mt-0.5 text-red-600 text-xs">{error}</p>
      </div>
    );
  }

  if (places.length === 0) {
    const message = hasSearched
      ? "No places found nearby. Try panning the map or choosing a different category."
      : "Select a category above to search for nearby places.";
    return (
      <p className="mt-4 text-sm text-gray-400 text-center px-2">{message}</p>
    );
  }

  return (
    <ol className="mt-3 space-y-2 overflow-y-auto flex-1 min-h-0">
      {places.map((place) => {
        const isSelected = place.placeId === selectedPlaceId;
        return (
          <li key={place.placeId}>
            <button
              onClick={() => onSelect(place.placeId)}
              data-place-id={place.placeId}
              className={[
                "w-full text-left px-3 py-2 rounded-lg border transition-colors",
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-400"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {place.name}
              </p>
              {place.address && (
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {place.address}
                </p>
              )}
              {place.rating !== null && (
                <div className="mt-1">
                  <StarRating rating={place.rating} />
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
