"use client";

/**
 * hooks/useNearbySearch.ts
 *
 * Custom hook that wraps the Places API (New) — specifically Place.searchNearby.
 *
 * Why the new API instead of the legacy PlacesService?
 * ─────────────────────────────────────────────────────
 * Google deprecated the legacy `PlacesService.nearbySearch` callback-based API.
 * The replacement is the Places API (New), which must be separately enabled in
 * Google Cloud Console under "Places API (New)" (distinct from "Places API").
 *
 * Key differences from the legacy API
 * ─────────────────────────────────────
 * Old:  `new PlacesService(map).nearbySearch(request, callback)`
 * New:  `Place.searchNearby(request)` — static method, returns a Promise
 *
 * Old request shape:
 *   { location: LatLngLiteral, radius: number, type: string }
 *
 * New request shape:
 *   {
 *     fields: string[],            ← explicit field mask (only pay for what you request)
 *     locationRestriction: { center: LatLng, radius: number },
 *     includedTypes: string[],     ← array, not a single string
 *     maxResultCount: number,
 *   }
 *
 * Field masks
 * ───────────
 * The new API bills per field group.  We request only what we display:
 *   "id"           → place_id equivalent
 *   "displayName"  → place name
 *   "formattedAddress" → full address string
 *   "rating"       → numeric rating
 *   "location"     → LatLng for marker placement
 *
 * The Promise resolves to `{ places: Place[] }`.
 * Each `Place` instance exposes typed properties (place.displayName, etc.)
 * rather than raw strings — no casting required.
 */

import { useState, useCallback } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import "@/lib/google-maps";
import {
  type PlaceCategory,
  type NearbyPlace,
  SEARCH_RADIUS_METERS,
} from "@/lib/places";

interface UseNearbySearchResult {
  places: NearbyPlace[];
  loading: boolean;
  error: string | null;
  /** Run a nearby search around `center` for the given place `type`. */
  search: (
    map: google.maps.Map,
    center: google.maps.LatLngLiteral,
    type: PlaceCategory
  ) => void;
}

export function useNearbySearch(): UseNearbySearchResult {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    (
      _map: google.maps.Map,
      center: google.maps.LatLngLiteral,
      type: PlaceCategory
    ) => {
      setLoading(true);
      setError(null);
      setPlaces([]);

      importLibrary("places").then((placesLib) => {
        const { Place } = placesLib as typeof google.maps.places;

        // The new API uses a field mask to control which data is returned.
        // Only request fields that are actually displayed in the UI.
        const request: google.maps.places.SearchNearbyRequest = {
          fields: ["id", "displayName", "formattedAddress", "rating", "location"],
          locationRestriction: {
            center,
            radius: SEARCH_RADIUS_METERS,
          },
          includedTypes: [type],
          maxResultCount: 20,
        };

        Place.searchNearby(request)
          .then(({ places: results }) => {
            setLoading(false);

            if (!results || results.length === 0) {
              setError("No places found nearby. Try panning the map.");
              return;
            }

            const normalised: NearbyPlace[] = results
              .filter((p) => p.id && p.location)
              .map((p) => ({
                placeId: p.id!,
                name: p.displayName ?? "Unknown",
                address: p.formattedAddress ?? "",
                rating: p.rating ?? null,
                location: p.location!.toJSON(),
              }));

            setPlaces(normalised);
          })
          .catch((err: unknown) => {
            setLoading(false);
            const message =
              err instanceof Error ? err.message : "Places search failed.";
            setError(message);
          });
      });
    },
    []
  );

  return { places, loading, error, search };
}
