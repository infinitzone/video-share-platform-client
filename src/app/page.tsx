"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VIdeoCard";
import Link from "next/link";

// Helper: format view count
function formatViews(views: number): string {
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + "M views";
  if (views >= 1_000) return (views / 1_000).toFixed(1) + "K views";
  return views + " views";
}

// Helper: format duration (seconds → "mm:ss")
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Helper: relative time
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) return diffYear + " year" + (diffYear > 1 ? "s" : "") + " ago";
  if (diffMonth > 0) return diffMonth + " month" + (diffMonth > 1 ? "s" : "") + " ago";
  if (diffDay > 0) return diffDay + " day" + (diffDay > 1 ? "s" : "") + " ago";
  if (diffHour > 0) return diffHour + " hour" + (diffHour > 1 ? "s" : "") + " ago";
  if (diffMin > 0) return diffMin + " minute" + (diffMin > 1 ? "s" : "") + " ago";
  return "Just now";
}

interface Video {
  id: string;
  user_id: string;
  title: string;
  description: string;
  video_path: string;
  thumbnail_path: string;
  mime_type: string;
  file_size: number;
  duration: number;
  width: number;
  height: number;
  views: number;
  likes_count: number;
  created_at: string;
}

interface FeedResponse {
  videos: Video[];
  nextCursor: string | null;
  hasMore: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4444";
const THUMBNAIL_API = process.env.THUMBNAIL_API || "http://localhost";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Helper to get full thumbnail URL
  const getThumbnailUrl = (path: string): string => {
    if (!path) return "/placeholder-thumbnail.jpg"; // fallback
    if (path.startsWith("http")) return path;
    return `${THUMBNAIL_API}${path}`;
  };

  const fetchFeed = useCallback(async (cursorParam: string | null = null) => {
    try {
      setError(null);
      const params = new URLSearchParams({ limit: "20" });
      if (cursorParam) params.append("cursor", cursorParam);

      const res = await fetch(`${API_BASE}/video/fetch/feed?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data: FeedResponse = await res.json();

      setVideos((prev) =>
        cursorParam ? [...prev, ...data.videos] : data.videos
      );
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err: any) {
      setError(err.message || "Failed to load videos");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(null);
  }, [fetchFeed]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchFeed(cursor);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, cursor, fetchFeed]);

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar />
        <main className="lg:ml-64 pt-[var(--header-height)] flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchFeed(null);
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
    <div className="min-h-screen bg-canvas-default text-fg-default">
      <Navbar />

      <aside
        className={`fixed left-0 top-[var(--header-height)] z-40 h-[calc(100vh-var(--header-height))] w-64 border-r border-border-default bg-canvas-default transition-transform duration-fast ease-out-expo lg:translate-x-0 ${
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
              <button className="group flex w-full cursor-pointer items-center justify-between rounded-2 px-2 py-2 text-left bg-canvas-inset hover:bg-canvas-subtle border-1 border-border-subtle">
                <div className="min-w-0">
                  <p className="truncate text-sm text-fg-default">Technology</p>
                  <p className="text-xs text-fg-muted">24K videos</p>
                </div>
                <span className="text-xs text-accent group-hover:text-accent-hover">→</span>
              </button>
              <button className="group flex w-full cursor-pointer items-center justify-between rounded-2 px-2 py-2 text-left bg-canvas-inset hover:bg-canvas-subtle border-1 border-border-subtle">
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
        className="fixed bottom-2 left-2 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border-default bg-canvas-elevated text-fg-default shadow-lg lg:hidden"
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
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/watch?v=${video.id}`}
              // Uncomment below to open in new tab:
              // target="_blank"
              // rel="noopener noreferrer"
            >
              <VideoCard
                thumbnail={getThumbnailUrl(video.thumbnail_path)}
                avatar="/avatars/default.jpg"
                title={video.title}
                channel={video.user_id}
                views={formatViews(video.views)}
                published={timeAgo(video.created_at)}
                duration={formatDuration(video.duration)}
              />
            </Link>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        )}
        {!loading && hasMore && (
          <div ref={observerRef} className="flex justify-center py-4">
            {loadingMore ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
            ) : (
              <span className="text-sm text-fg-muted">Load more</span>
            )}
          </div>
        )}
        {!hasMore && videos.length > 0 && (
          <div className="text-center text-sm text-fg-muted py-4">
            You've reached the end 🎉
          </div>
        )}
      </main>
    </div>
  );
}