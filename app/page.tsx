/**
 * app/page.tsx
 *
 * Root page — Server Component (no "use client" directive needed here).
 *
 * MapSection is a Client Component that owns the dynamic import with
 * ssr: false. Next.js 16 requires `next/dynamic` with `ssr: false` to
 * live inside a Client Component boundary.
 *
 * Phase 2: The page layout is unchanged — MapSection now renders an internal
 * sidebar + map layout so no structural changes are needed here.
 */

import MapSection from "@/components/MapSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Google Maps — Nearby Search
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Maps JavaScript API + Places API · select a category to search around
          the current map centre
        </p>
      </header>

      {/* MapSection fills the remaining viewport height */}
      <main className="flex-1 p-4">
        <div className="w-full h-[calc(100vh-88px)]">
          <MapSection />
        </div>
      </main>
    </div>
  );
}
