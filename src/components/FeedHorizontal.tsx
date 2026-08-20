// src/components/FeedHorizontal.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import VideoCardHorizontal from "@/components/VideoCardHorizontal";

interface Video {
  id: string;
  title: string;
  thumbnail_path: string;
  user_id: string;
  avatar: string;
  views_count: number;
  duration: number;
  created_at: string;
}

// ----- helper functions (kept exactly the same) -----
function formatviews_count(views_count: number): string {
  if (views_count >= 1_000_000) return (views_count / 1_000_000).toFixed(1) + "M views_count";
  if (views_count >= 1_000) return (views_count / 1_000).toFixed(1) + "K views_count";
  return views_count + " views";
}

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

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getThumbnailUrl(path: string): string {
  if (!path) return "/placeholder-thumbnail.jpg";
  if (path.startsWith("http")) return path;
  return `/api/thumbnail?path=${encodeURIComponent(path)}`;
}
// -----------------------------------------------

export default function FeedHorizontal() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef<HTMLDivElement>(null);

  const fetchVideos = useCallback(async (nextCursor?: string) => {
    try {
      setError(null);
      const params = new URLSearchParams({ limit: "20" });
      if (nextCursor) params.append("cursor", nextCursor);

      const res = await fetch(`/api/feed?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      setVideos((prev) => (nextCursor ? [...prev, ...data.videos] : data.videos));
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore ?? false);
    } catch (err: any) {
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          fetchVideos(cursor || undefined);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, cursor, loading, fetchVideos]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">⚠️ {error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchVideos();
          }}
          className="mt-2 px-4 py-2 bg-accent text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    // Replaced generic p-4 with tight margins to match watch sidebar
    <div className="flex flex-col gap-1 pr-2 pb-6">
      {videos.map((video, index) => {
        const isLast = index === videos.length - 1;
        return (
          <Link key={video.id} href={`/watch?v=${video.id}`} passHref className="no-underline text-current">
            <div ref={isLast ? observerRef : null}>
              <VideoCardHorizontal
                thumbnail={getThumbnailUrl(video.thumbnail_path)}
                title={video.title}
                channel={String(video.user_id)}
                avatar={video.avatar}
                views_count={formatviews_count(video.views_count)}
                published={timeAgo(video.created_at)}
                duration={formatDuration(video.duration)}
              />
            </div>
          </Link>
        );
      })}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
        </div>
      )}
      {!hasMore && videos.length > 0 && (
        <div className="text-center text-sm text-fg-muted py-4">
          You've reached the end 🎉
        </div>
      )}
    </div>
  );
}