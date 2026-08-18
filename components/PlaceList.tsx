"use client";

/**
 * components/PlaceList.tsx
 *
 * Displays the nearby-search results as a scrollable list.
 *
 * Each card shows:
 *   • Place name
 *   • Address (vicinity)
 *   • Star rating (if available)
 *   • Place ID (small, muted)
 *
 * Clicking a card calls onSelect so the parent can highlight the
 * corresponding marker on the map.
 */

import { type NearbyPlace } from "@/lib/places";

interface PlaceListProps {
  places: NearbyPlace[];
  loading: boolean;
  error: string | null;
  selectedPlaceId: string | null;
  onSelect: (placeId: string) => void;
}

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

export default function PlaceList({
  places,
  loading,
  error,
  selectedPlaceId,
  onSelect,
}: PlaceListProps) {
  if (loading) {
    return (
      <p className="text-sm text-gray-500 mt-4 text-center animate-pulse">
        Searching nearby…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 mt-4 text-center">{error}</p>
    );
  }

  if (places.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-4 text-center">
        Select a category to find nearby places.
      </p>
    );
  }

  return (
    <ol className="mt-3 space-y-2 overflow-y-auto flex-1">
      {places.map((place) => {
        const isSelected = place.placeId === selectedPlaceId;
        return (
          <li key={place.placeId}>
            <button
              onClick={() => onSelect(place.placeId)}
              className={[
                "w-full text-left px-3 py-2 rounded-lg border transition-colors",
                isSelected
                  ? "border-blue-500 bg-blue-50"
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
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                ID: {place.placeId}
              </p>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
