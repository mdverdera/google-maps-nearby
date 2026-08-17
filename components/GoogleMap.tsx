"use client";

/**
 * components/GoogleMap.tsx
 *
 * Client component — must be "use client" because it:
 *   1. Uses useRef  to get a handle on the DOM div after mount.
 *   2. Uses useEffect to run initialisation code in the browser.
 *   3. Depends on the Google Maps JavaScript API, which is browser-only.
 *
 * How initialisation works
 * ────────────────────────
 * 1. The component renders a plain <div> that acts as the map container.
 * 2. After the first paint (useEffect), we call importLibrary("maps") which:
 *      a. Calls setOptions() to inject the API key (done in lib/google-maps.ts).
 *      b. Injects <script src="https://maps.googleapis.com/maps/api/js?key=...">
 *         into <head> on the first call. Subsequent calls reuse the cached Promise.
 *      c. Resolves with the `maps` library object containing the Map constructor.
 * 3. We pass the container div ref and options to new Map().
 *    The Map constructor takes ownership of the div and renders tiles inside it.
 */

import { useEffect, useRef } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import "@/lib/google-maps"; // ensure setOptions() runs before importLibrary()
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/google-maps";

interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

export default function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    importLibrary("maps").then(({ Map }) => {
      new Map(container, {
        center,
        zoom,
      });
    });
  }, [center, zoom]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg"
      aria-label="Google Map"
    />
  );
}
