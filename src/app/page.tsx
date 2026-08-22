"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Feed from "@/components/Feed";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar isHomePage onCollapseChange={setIsCollapsed} />
        <main className="lg:ml-64 pt-[var(--header-height)] flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-accent text-white rounded"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-subtle text-fg-default">
      <Navbar
        customClass="nav-use-blur"
        isHomePage
        onCollapseChange={setIsCollapsed}
      />

      <main
        className={`pt-[var(--header-height)] transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <div className="mt-4 max-w-[2200px] md:px-4">
          <Feed />
        </div>
      </main>
    </div>
  );
}