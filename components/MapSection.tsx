"use client";

/**
 * components/MapSection.tsx
 *
 * Orchestration layer — ties the map, category bar, and results list
 * together without containing any business logic itself.
 *
 * State held here
 * ───────────────
 * • `mapInstance`     — the live google.maps.Map, received via onMapReady.
 * • `activeCategory`  — which category button is currently selected.
 * • `selectedPlaceId` — which list item / marker is currently highlighted.
 * • `hasSearched`     — becomes true after the first search; used to show the
 *                       correct empty-state message in PlaceList.
 *
 * Data flow
 * ─────────
 *  CategoryBar click
 *    → handleCategorySelect
 *      → reads map.getCenter() to get current latitude/longitude
 *      → calls search(map, center, type)  [useNearbySearch]
 *        → Places API searchNearby Promise resolves
 *          → places state updated
 *            → GoogleMap re-renders markers
 *            → PlaceList re-renders items
 *
 *  List item click
 *    → setSelectedPlaceId
 *      → GoogleMap pans + opens InfoWindow for that marker
 *
 *  Map marker click
 *    → handleMarkerClick
 *      → setSelectedPlaceId
 *        → PlaceList highlights that card and scrolls it into view
 *
 * Responsive layout
 * ──────────────────
 * Mobile  (< md): flex-col — map on top (fixed min-height), list scrolls below.
 * Desktop (≥ md): flex-row — sidebar fixed-width on the left, map fills the rest.
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
  const [hasSearched, setHasSearched] = useState(false);

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
      setHasSearched(true);

      // getCenter() returns the LatLng at the current map centre.
      // toJSON() converts it to a plain { lat, lng } literal.
      const center = map.getCenter()!.toJSON();
      search(map, center, type);
    },
    [search]
  );

  // Called when the user clicks a marker on the map.
  // Highlights the matching list card and scrolls it into view.
  const handleMarkerClick = useCallback((placeId: string) => {
    setSelectedPlaceId(placeId);

    // Defer scroll until after the selected highlight has been painted.
    requestAnimationFrame(() => {
      const card = document.querySelector(`[data-place-id="${placeId}"]`);
      card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  return (
    /*
     * Both mobile and desktop: h-full fills the <main flex-1 min-h-0> which
     * fills the viewport minus the header. Nothing overflows the page.
     *
     * Mobile  (< md) — flex-col:
     *   Map:     shrink-0 h-[280px] — always visible, never scrolls away.
     *   Sidebar: flex-1 min-h-0 — takes the remaining height.
     *     CategoryBar: shrink-0 — always visible.
     *     PlaceList:   flex-1 overflow-y-auto — only this part scrolls.
     *
     * Desktop (≥ md) — flex-row:
     *   Sidebar: shrink-0 w-72, same inner structure as mobile.
     *   Map:     flex-1 — fills remaining width at full height.
     */
    <div className="flex flex-col md:flex-row h-full gap-4">

      {/* ── Map ──
           Mobile:  fixed 280 px tall, always visible above the sidebar.
           Desktop: flex-1, fills the full right column height. */}
      <div className="order-1 md:order-2 w-full md:flex-1 md:min-w-0 shrink-0 h-[280px] md:h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <GoogleMap
          onMapReady={handleMapReady}
          places={places}
          selectedPlaceId={selectedPlaceId}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* ── Sidebar ──
           flex-1 min-h-0: takes all remaining height after the map on mobile,
           full height on desktop. Inner list scrolls; category bar does not. */}
      <aside className="order-2 md:order-1 w-full md:w-72 md:shrink-0 flex-1 min-h-0 flex flex-col">
        <CategoryBar
          active={activeCategory}
          loading={loading}
          onSelect={handleCategorySelect}
        />

        <PlaceList
          places={places}
          loading={loading}
          error={error}
          hasSearched={hasSearched}
          selectedPlaceId={selectedPlaceId}
          onSelect={setSelectedPlaceId}
        />
      </aside>
    </div>
  );
}
