"use client";

/**
 * components/GoogleMap.tsx
 *
 * Client component — must be "use client" because it:
 *   1. Uses useRef  to hold the DOM container and the live Map instance.
 *   2. Uses useEffect to initialise and update the map in the browser.
 *   3. Depends on the Google Maps JavaScript API (browser-only).
 *
 * Props
 * ─────
 * `onMapReady`      — called once with the `google.maps.Map` instance so the
 *                     parent can read `map.getCenter()` when running a search.
 *
 * `places`          — array of NearbyPlace objects. Whenever this array changes,
 *                     old markers are removed and new ones are created.
 *
 * `selectedPlaceId` — when the parent selects a place (e.g. from the list),
 *                     the map pans to it and its InfoWindow opens.
 *
 * `onMarkerClick`   — called with the placeId when the user clicks a marker,
 *                     so the parent can highlight the corresponding list item.
 *
 * Marker management — AdvancedMarkerElement (Places API New)
 * ───────────────────────────────────────────────────────────
 * The new Places API (New) requires `AdvancedMarkerElement` instead of the
 * deprecated `google.maps.Marker`.  Key differences:
 *
 * • Loaded from `importLibrary("marker")` → `AdvancedMarkerElement`.
 * • The Map must be created with a `mapId` option.  We use `"DEMO_MAP_ID"`,
 *   a Google-provided literal for development that requires no Cloud Console
 *   configuration.  For production, create a real Map ID in Google Cloud.
 * • Removal: `marker.map = null` (property assignment, not `.setMap(null)`).
 * • InfoWindow: `infoWindow.open({ map, anchor: marker })` — object form.
 *
 * InfoWindow
 * ──────────
 * A single shared InfoWindow is reused across all markers.  Opening it on
 * one marker automatically closes it on any previously-open marker.
 * We populate its content with an HTML string built from the place's data.
 */

import { useEffect, useRef, useCallback } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import "@/lib/google-maps";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/google-maps";
import { type NearbyPlace } from "@/lib/places";

interface GoogleMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  places?: NearbyPlace[];
  selectedPlaceId?: string | null;
  onMapReady?: (map: google.maps.Map) => void;
  /** Called with the placeId when the user clicks a marker on the map. */
  onMarkerClick?: (placeId: string) => void;
}

/** Build the HTML string shown inside a marker's InfoWindow. */
function buildInfoContent(place: NearbyPlace): string {
  const rating =
    place.rating !== null
      ? `<span style="color:#ca8a04">${"★".repeat(Math.round(place.rating))}</span> ${place.rating.toFixed(1)}`
      : "No rating";
  return `
    <div style="font-family:sans-serif;font-size:13px;max-width:220px;line-height:1.5">
      <strong style="font-size:14px">${place.name}</strong><br/>
      ${place.address ? `<span style="color:#555">${place.address}</span><br/>` : ""}
      ${rating}
    </div>
  `.trim();
}

export default function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  places = [],
  selectedPlaceId = null,
  onMapReady,
  onMarkerClick,
}: GoogleMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  // AdvancedMarkerElement is the new marker type required by the Places API (New).
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  // Map from placeId → AdvancedMarkerElement for lookup by ID.
  const markerMapRef = useRef<
    Map<string, google.maps.marker.AdvancedMarkerElement>
  >(new Map());

  // ── Initialise the map once ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    Promise.all([importLibrary("maps")]).then(([{ Map, InfoWindow }]) => {
      const map = new Map(container, {
        center,
        zoom,
        // mapId is required for AdvancedMarkerElement.
        // "DEMO_MAP_ID" is a Google-provided literal for local development.
        // Replace with a real Map ID from Google Cloud Console for production.
        mapId: "DEMO_MAP_ID",
      });
      mapRef.current = map;
      infoWindowRef.current = new InfoWindow();
      onMapReady?.(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once — center/zoom are only the initial values

  // ── Re-render markers whenever the places array changes ─────────────────
  const renderMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove all existing markers from the map.
    // AdvancedMarkerElement uses `marker.map = null` instead of .setMap(null).
    markersRef.current.forEach((m) => {
      m.map = null;
    });
    markersRef.current = [];
    markerMapRef.current.clear();
    infoWindowRef.current?.close();

    if (places.length === 0) return;

    // Lazy-load the marker library (only needs to happen once; loader caches it).
    importLibrary("marker").then(({ AdvancedMarkerElement }) => {
      const map = mapRef.current;
      if (!map) return;

      places.forEach((place) => {
        const marker = new AdvancedMarkerElement({
          position: place.location,
          map,
          title: place.name,
        });

        // Clicking a marker opens the InfoWindow AND notifies the parent so
        // the matching list card can be highlighted and scrolled into view.
        marker.addListener("click", () => {
          infoWindowRef.current?.setContent(buildInfoContent(place));
          infoWindowRef.current?.open({ map, anchor: marker });
          onMarkerClick?.(place.placeId);
        });

        markersRef.current.push(marker);
        markerMapRef.current.set(place.placeId, marker);
      });
    });
  }, [places, onMarkerClick]);

  useEffect(() => {
    renderMarkers();
  }, [renderMarkers]);

  // ── Open InfoWindow when the parent selects a place (e.g. list click) ───
  useEffect(() => {
    if (!selectedPlaceId || !mapRef.current) return;
    const marker = markerMapRef.current.get(selectedPlaceId);
    if (!marker) return;
    const place = places.find((p) => p.placeId === selectedPlaceId);
    if (!place) return;
    infoWindowRef.current?.setContent(buildInfoContent(place));
    infoWindowRef.current?.open({ map: mapRef.current, anchor: marker });
    // Pan map to the selected place.
    mapRef.current.panTo(place.location);
  }, [selectedPlaceId, places]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg"
      aria-label="Google Map"
    />
  );
}
