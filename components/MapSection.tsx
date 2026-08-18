"use client";

/**
 * components/MapSection.tsx
 *
 * Orchestration layer — ties the map, category selector, and results list
 * together without containing any business logic itself.
 *
 * State held here
 * ───────────────
 * • `mapInstance`     — the live google.maps.Map, received via onMapReady.
 * • `activeCategory`  — which category button is currently selected.
 * • `selectedPlaceId` — which list item / marker is highlighted.
 *
 * Data flow
 * ─────────
 *  CategoryBar click
 *    → handleCategorySelect
 *      → reads map.getCenter() to get current latitude/longitude
 *      → calls search(map, center, type)  [useNearbySearch]
 *        → Places API nearbySearch callback
 *          → places state updated
 *            → GoogleMap re-renders markers
 *            → PlaceList re-renders items
 *
 * Why the dynamic import stays here
 * ──────────────────────────────────
 * GoogleMap uses the browser-only Google Maps JS SDK.  next/dynamic with
 * ssr: false prevents it from running during server-side rendering.
 * MapSection is already a Client Component so this is allowed.
 */

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useNearbySearch } from "@/hooks/useNearbySearch";
import CategoryBar from "@/components/CategoryBar";
import PlaceList from "@/components/PlaceList";
import { type PlaceCategory } from "@/lib/places";

const GoogleMap = dynamic(() => import("@/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500 text-sm">Loading map…</p>
    </div>
  ),
});

export default function MapSection() {
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | null>(
    null
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const { places, loading, error, search } = useNearbySearch();

  // Called once by GoogleMap after the Map instance is ready.
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map;
  }, []);

  // Called when the user clicks a category button.
  const handleCategorySelect = useCallback(
    (type: PlaceCategory) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      setActiveCategory(type);
      setSelectedPlaceId(null);

      // getCenter() returns the LatLng at the current map centre.
      // toJSON() converts it to a plain { lat, lng } literal.
      const center = map.getCenter()!.toJSON();
      search(map, center, type);
    },
    [search]
  );

  return (
    <div className="flex h-full gap-4">
      {/* ── Left sidebar ── */}
      <aside className="w-72 flex-shrink-0 flex flex-col">
        <CategoryBar
          active={activeCategory}
          loading={loading}
          onSelect={handleCategorySelect}
        />

        <PlaceList
          places={places}
          loading={loading}
          error={error}
          selectedPlaceId={selectedPlaceId}
          onSelect={setSelectedPlaceId}
        />
      </aside>

      {/* ── Map ── */}
      <div className="flex-1 min-w-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          onMapReady={handleMapReady}
          places={places}
          selectedPlaceId={selectedPlaceId}
        />
      </div>
    </div>
  );
}
