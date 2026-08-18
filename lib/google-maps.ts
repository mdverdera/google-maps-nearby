/**
 * lib/google-maps.ts
 *
 * Configures the Google Maps JavaScript API loader (v2 functional API).
 *
 * In @googlemaps/js-api-loader v2, instead of a `Loader` class instance,
 * you call `setOptions()` once to provide your API key, then call
 * `importLibrary()` to lazily load individual map libraries.
 *
 * `setOptions` must be called before any `importLibrary` call.
 * Calling it here at module initialisation time guarantees that.
 *
 * The `typeof window` guard prevents this code from running during Next.js
 * server-side rendering.  `setOptions` (and the `@googlemaps/js-api-loader`
 * package) accesses `window` internally, which does not exist in Node.js.
 * The guard is safe because `importLibrary` is only ever called from
 * useEffect hooks, which themselves only run in the browser.
 */

import { setOptions } from "@googlemaps/js-api-loader";

if (typeof window !== "undefined") {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. " +
        "Add it to .env.local and restart the dev server."
    );
  }

  // Register the API key once.  All subsequent importLibrary() calls share it.
  setOptions({ key: apiKey, v: "weekly" });
}

/** Default map centre — London, UK. */
export const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 14.6544,
  lng: 121.0530,
};

/** Default zoom level (city-level view). */
export const DEFAULT_ZOOM = 14;
