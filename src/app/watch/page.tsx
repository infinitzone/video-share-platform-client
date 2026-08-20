// app/watch/page.tsx
import { Suspense } from "react";
import WatchContent from "./WatchContent";

export default function WatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-canvas-default text-fg-default">
        {/* Optional: show a loading skeleton */}
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}