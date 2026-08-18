/**
 * lib/places.ts
 *
 * Shared types and constants for the Places nearby-search feature.
 *
 * Place type strings — Places API (New)
 * ──────────────────────────────────────
 * The Places API (New) accepts an `includedTypes` array.  The type strings are
 * defined by Google:
 *   https://developers.google.com/maps/documentation/places/web-service/place-types
 *
 * Notable change from legacy API:
 *   Legacy:  type: "lodging"       (Hotels used the "lodging" type)
 *   New:     includedTypes: ["lodging"]  (same string, now in an array)
 */

/** The three place categories the user can search. */
export type PlaceCategory = "restaurant" | "lodging" | "hospital";

export interface CategoryOption {
  /** Label shown in the UI button. */
  label: string;
  /** Google Places API `type` string. */
  type: PlaceCategory;
}

export const CATEGORIES: CategoryOption[] = [
  { label: "Restaurants", type: "restaurant" },
  { label: "Hotels", type: "lodging" },
  { label: "Hospitals", type: "hospital" },
];

/**
 * Search radius in metres.
 *
 * 1 500 m gives a walkable / city-block result set without being so wide
 * that results become irrelevant.
 */
export const SEARCH_RADIUS_METERS = 1500;

/**
 * A normalised place result — a plain-data subset of the new
 * google.maps.places.Place class, containing only the fields we display.
 *
 * Fields requested via the field mask in useNearbySearch:
 *   id              → placeId
 *   displayName     → name
 *   formattedAddress → address
 *   rating          → rating
 *   location        → location (converted to LatLngLiteral via .toJSON())
 */
export interface NearbyPlace {
  placeId: string;
  name: string;
  /** Short address returned by the API as `vicinity`. */
  address: string;
  rating: number | null;
  location: google.maps.LatLngLiteral;
}
