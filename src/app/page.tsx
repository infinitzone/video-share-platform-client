"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Feed from "@/components/Feed";


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);


  if (error) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar />
        <main className="lg:ml-64 pt-[var(--header-height)] flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={() => {
                setError(null);
              }}
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
      <Navbar bg={"bg-canvas-subtle"} />

      <aside
        className={`fixed left-0 top-[var(--header-height)] z-40 h-[calc(100vh-var(--header-height))] w-64 border-r border-border-default bg-canvas-subtle transition-transform duration-fast ease-out-expo lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar content unchanged – keep your existing nav */}
        <nav className="flex flex-col gap-2 p-4">
          <div>
            <div className="flex w-full cursor-pointer items-center justify-between text-fg-default">
              <span>Subscriptions</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                viewBox="0 -960 960 960"
                width="20"
                fill="currentColor"
                className="text-fg-muted"
              >
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
              </svg>
            </div>
          </div>
          <div className="my-2 h-px w-full bg-border-subtle" />
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg-default">Trending</h2>
              <span className="text-xs text-fg-muted">Explore</span>
            </div>
            <div className="flex flex-col gap-1">
              <button className="group flex w-full cursor-pointer items-center justify-between rounded-2 px-2 py-2 text-left bg-canvas-overlay hover:bg-canvas-elevated border-1 border-border-subtle">
                <div className="min-w-0">
                  <p className="truncate text-sm text-fg-default">Technology</p>
                  <p className="text-xs text-fg-muted">24K videos</p>
                </div>
                <span className="text-xs text-accent group-hover:text-accent-hover">→</span>
              </button>
              <button className="group flex w-full cursor-pointer items-center justify-between rounded-2 px-2 py-2 text-left bg-canvas-overlay hover:bg-canvas-elevated border-1 border-border-subtle">
                <div className="min-w-0">
                  <p className="truncate text-sm text-fg-default">AI</p>
                  <p className="text-xs text-fg-muted">14K videos</p>
                </div>
                <span className="text-xs text-accent group-hover:text-accent-hover">→</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setSidebarOpen((open) => !open)}
        className="fixed bottom-2 left-2 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-default bg-canvas-elevated text-fg-default shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 -960 960 960"
          fill="currentColor"
        >
          <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
        </svg>
      </button>

      <main className="lg:ml-64 pt-[var(--header-height)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-4 lg:ml-5">
          <Feed/>
        </div>
      </main>
    </div>
  );
}