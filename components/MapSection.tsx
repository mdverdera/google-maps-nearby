"use client";

/**
 * components/MapSection.tsx
 *
 * Thin client-component shell whose only job is to hold the dynamic import
 * with ssr: false. Next.js 16 requires that `next/dynamic` with `ssr: false`
 * lives inside a Client Component, not a Server Component.
 */

import dynamic from "next/dynamic";

const GoogleMap = dynamic(() => import("@/components/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-500 text-sm">Loading map…</p>
    </div>
  ),
});

export default function MapSection() {
  return <GoogleMap />;
}
