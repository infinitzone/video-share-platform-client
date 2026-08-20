// app/watch/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FeedHorizontal from "@/components/FeedHorizontal";

// ---------- Helpers ----------
function formatviews_count(views_count: number): string {
  if (views_count >= 1_000_000) return (views_count / 1_000_000).toFixed(1) + "M views_count";
  if (views_count >= 1_000) return (views_count / 1_000).toFixed(1) + "K views_count";
  return views_count + " views_count";
}

// get dominant color from an image URL (works with proxy)
function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    img.onerror = reject;
  });
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

// ---------- Types ----------
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
  views_count: number;
  likes_count: number;
  created_at: string;
}

// ---------- Main Component ----------
export default function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");

  // States
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [glowColor, setGlowColor] = useState<string>("rgb(100,100,100)");
  const [realtimeGlowColors, setRealtimeGlowColors] = useState<{
    c1: string;
    c2: string;
    c3: string;
  }>({
    c1: "rgb(100,100,100)",
    c2: "rgb(100,100,100)",
    c3: "rgb(100,100,100)",
  });
  const [colorLoaded, setColorLoaded] = useState(false);

  // navbar background state and ref for the video container & video element ---
  const [navbarBg, setNavbarBg] = useState("bg-transparent");
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Comment state
  const [comment, setComment] = useState("");
  const hasText = comment.trim().length > 0;

  // Helper: full thumbnail URL – now uses a proxy to avoid CORS
  const getThumbnailUrl = (path: string): string => {
    if (!path) return "/placeholder-thumbnail.jpg";
    if (path.startsWith("http")) return path;
    return `/api/thumbnail?path=${encodeURIComponent(path)}`;
  };

  // Extract dominant colour from thumbnail when video loads
  useEffect(() => {
    if (!video) return;
    const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);
    getDominantColor(thumbnailUrl)
      .then((color) => {
        setGlowColor(color);
        setRealtimeGlowColors({ c1: color, c2: color, c3: color });
        setColorLoaded(true);
      })
      .catch(() => {
        setGlowColor("rgba(100,100,100,0.3)");
        setRealtimeGlowColors({
          c1: "rgba(100,100,100,0.3)",
          c2: "rgba(100,100,100,0.3)",
          c3: "rgba(100,100,100,0.3)",
        });
      });
  }, [video]);

  // Spatial color sampler engine: extracts 3 distinct region colors across video frames
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const canvas = document.createElement("canvas");
    canvas.width = 12;
    canvas.height = 12;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animFrameId: number;

    const getRegionAvg = (x: number, y: number, w: number, h: number): string => {
      const imgData = ctx.getImageData(x, y, w, h).data;
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
        count++;
      }
      return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
    };

    const processFrame = () => {
      if (videoEl.paused || videoEl.ended) return;

      try {
        ctx.drawImage(videoEl, 0, 0, 12, 12);

        // Region 1: Top-Left (6x6)
        const color1 = getRegionAvg(0, 0, 6, 6);
        // Region 2: Top-Right / Center (6x6)
        const color2 = getRegionAvg(6, 0, 6, 6);
        // Region 3: Bottom Center (6x6)
        const color3 = getRegionAvg(3, 6, 6, 6);

        setRealtimeGlowColors({
          c1: color1,
          c2: color2,
          c3: color3,
        });
      } catch (e) {
        // Fallback for potential cross-origin restriction
      }

      if ("requestVideoFrameCallback" in videoEl) {
        (videoEl as any).requestVideoFrameCallback(processFrame);
      } else {
        animFrameId = requestAnimationFrame(processFrame);
      }
    };

    const handlePlay = () => processFrame();
    const handleSeeked = () => processFrame();

    videoEl.addEventListener("play", handlePlay);
    videoEl.addEventListener("seeked", handleSeeked);

    return () => {
      videoEl.removeEventListener("play", handlePlay);
      videoEl.removeEventListener("seeked", handleSeeked);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [loading]);

  const fetchVideo = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/video/info?id=${id}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setVideo(data);
    } catch (err: any) {
      setError(err.message || "Failed to load video");
    }
  }, []);

  // Load data when videoId changes
  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([fetchVideo(videoId)]).finally(() => setLoading(false));
  }, [videoId, fetchVideo]);

  // --- Scroll effect for navbar background ---
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const headerHeight = header.offsetHeight;

    const handleScroll = () => {
      if (!videoContainerRef.current) return;
      const rect = videoContainerRef.current.getBoundingClientRect();
      if (rect.top <= headerHeight) {
        setNavbarBg("bg-canvas-subtle");
      } else {
        setNavbarBg("bg-transparent");
      }
    };

    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, []);

  // ---------- Render states ----------
  if (!videoId) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar />
        <main className="pt-[var(--header-height)] flex items-center justify-center">
          <p className="text-fg-muted">No video ID provided.</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar />
        <main className="pt-[var(--header-height)] flex items-center justify-center">
          <div className="text-center p-8">
            <p className="text-red-500 mb-4">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-accent text-white rounded"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-canvas-default text-fg-default">
        <Navbar />
        <main className="pt-[var(--header-height)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </main>
      </div>
    );
  }

  // -------- Render main content --------
  const videoUrl = `/api/video?id=${video.id}`;

  return (
    <div className="min-h-screen bg-canvas-subtle text-fg-default">
      {/* Navbar with dynamic background */}
      <Navbar bg={navbarBg} />

      <main className="pt-[var(--header-height)] mt-2 w-full">
        <div className="mx-auto px-0 py-2 sm:px-2 sm:py-2 lg:px-3">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: video player + info + comments */}
            <div className="w-full lg:w-[70%] min-w-0 relative">
              {/* Video container with the ref */}
              <div ref={videoContainerRef} className="relative aspect-video">
                {/* Glow layers */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-2"
                  style={{
                    "--glow-color": realtimeGlowColors.c1,
                    "--glow-color-2": realtimeGlowColors.c2,
                    "--glow-color-3": realtimeGlowColors.c3,
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-3"
                  style={{
                    "--glow-color": realtimeGlowColors.c1,
                    "--glow-color-2": realtimeGlowColors.c2,
                    "--glow-color-3": realtimeGlowColors.c3,
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-4"
                  style={{
                    "--glow-color": glowColor,
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-5"
                  style={{
                    "--glow-color": glowColor,
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-6"
                  style={{
                    "--glow-color": realtimeGlowColors.c1,
                    "--glow-color-2": realtimeGlowColors.c2,
                    "--glow-color-3": realtimeGlowColors.c3,
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none glow-effect-7"
                  style={{
                    "--glow-color": realtimeGlowColors.c1,
                    "--glow-color-2": realtimeGlowColors.c2,
                    "--glow-color-3": realtimeGlowColors.c3,
                  } as React.CSSProperties}
                />

                {/* Video player */}
                <div className="relative z-10 w-full h-full overflow-hidden rounded-none sm:rounded-xl">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    className="block w-full h-full object-contain bg-black"
                  />
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-1 py-2 px-3 sm:px-0">
                <h1 className="text-xl font-semibold text-fg-default leading-tight">
                  {video.title}
                </h1>

                {/* Channel row */}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent-fg font-bold text-sm">
                      {String(video.user_id || "").charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-fg-default">Hridoy Hosen</p>
                      <p className="text-xs text-fg-muted">
                        15k subscribers
                      </p>
                    </div>
                    <button className="btn btn-primary" style={{ borderRadius: "50px" }}>
                      Subscribe
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button className="btn btn-secondary btn-is" style={{ borderRadius: "50px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                      >
                        <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                      </svg>
                      <span>{video.likes_count || 0}</span>
                    </button>
                    <button className="btn btn-secondary btn-is" style={{ borderRadius: "50px" }}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 -960 960 960"
                        fill="currentColor"
                      >
                        <path d="M720-80q-50 0-85-35t-35-85q0-13 3-25t9-23L350-380q-14 14-32 22t-38 8q-50 0-85-35t-35-85q0-50 35-85t85-35q20 0 38 8t32 22l262-162q-6-11-9-23t-3-25q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-20 0-38-8t-32-22L350-580q6 11 9 23t3 25q0 13-3 25t-9 23l262 162q14-14 32-22t38-8q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-560q17 0 28.5-11.5T760-680q0-17-11.5-28.5T720-720q-17 0-28.5 11.5T680-680q0 17 11.5 28.5T720-640ZM240-440q17 0 28.5-11.5T280-480q0-17-11.5-28.5T240-520q-17 0-28.5 11.5T200-480q0 17 11.5 28.5T240-440Zm480 280q17 0 28.5-11.5T760-200q0-17-11.5-28.5T720-240q-17 0-28.5 11.5T680-200q0 17 11.5 28.5T720-160Z" />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 p-3 rounded-xl bg-canvas-subtle text-fg-default text-sm bg-canvas-elevated">
                  <p className="whitespace-pre-wrap">
                    <span>{video.views_count | 0} views ○ {timeAgo(video.created_at)} </span>{" "}
                    <span className="text-fg-muted">{video.description || "No description"}</span>
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="py-2 border-t border-border-subtle pt-6 px-3 sm:px-0">
                <h2 className="text-lg font-semibold text-fg-default mb-4">Comments</h2>

                <div className="flex items-end gap-3 mb-6 mt-4">
                  <textarea
                    className="add-comment-textarea text-base md:text-[1.2rem]"
                    rows={1}
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  {hasText && (
                    <button
                      onClick={() => {}}
                      className="btn btn-primary"
                      style={{ borderRadius: "50px" }}
                    >
                      Comment
                    </button>
                  )}
                </div>

                <div className="space-y-4 flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-success-subtle text-success-fg flex items-center justify-center font-bold text-sm flex-shrink-0">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-fg-default">alex</span>
                          <span className="text-xs text-fg-muted">3 min ago</span>
                        </div>
                        <p className="text-sm text-fg-default mt-0.5 leading-snug">
                          This is a great update! When will the new API docs be published?
                        </p>

                        <div className="mt-1 flex items-center gap-4">
                          <div className="flex items-center">
                            <button
                              className="btn btn-ghost flex items-center"
                              style={{ padding: 0, paddingRight: "5px" }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 -960 960 960"
                                fill="currentColor"
                              >
                                <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                              </svg>
                            </button>
                            <span className="text-sm text-fg-muted">15k</span>
                          </div>
                          <button className="btn btn-ghost">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Related Videos */}
            <div className="z-10 w-full py-2 lg:w-[30%] lg:flex-shrink-0" style={{ paddingTop: "0" }}>
              <FeedHorizontal />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}