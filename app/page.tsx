/**
 * app/page.tsx
 *
 * Root page — Server Component (no "use client" directive needed here).
 *
 * MapSection is a Client Component that owns the dynamic import with
 * ssr: false. Next.js 16 requires `next/dynamic` with `ssr: false` to
 * live inside a Client Component boundary.
 */

import MapSection from "@/components/MapSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Page header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Google Maps — Location Nearby Search
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Maps JavaScript API · pan and zoom to explore
        </p>
      </header>

      {/* Map fills the remaining viewport height */}
      <main className="flex-1 p-4">
        <div className="w-full h-[calc(100vh-88px)] shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <MapSection />
        </div>
      </main>
    </div>
  );
}
