/**
 * app/page.tsx
 *
 * Root page — Server Component (no "use client" directive needed here).
 *
 * MapSection is a Client Component that owns the dynamic import with
 * ssr: false. Next.js requires `next/dynamic` with `ssr: false` to
 * live inside a Client Component boundary.
 *
 * Layout
 * ──────
 * Desktop: MapSection fills the remaining viewport height after the header.
 * Mobile:  MapSection grows naturally — map has a fixed min-height, list
 *          scrolls below it, so nothing is ever clipped.
 */

import MapSection from "@/components/MapSection";

export default function Home() {
  return (
    /*
     * h-screen + overflow-hidden on ALL breakpoints:
     * the page is always locked to the viewport — no browser scroll on
     * mobile or desktop. Scrolling happens only inside the results list.
     */
    <div className="h-screen overflow-hidden flex flex-col bg-gray-50">
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Google Maps — Nearby Search
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Maps JavaScript API + Places API · select a category to search around
          the current map centre
        </p>
      </header>

      {/* flex-1 min-h-0: takes all remaining height after the header.
          min-h-0 lets its flex children shrink below their natural size. */}
      <main className="flex-1 min-h-0 p-4">
        <MapSection />
      </main>
    </div>
  );
}
