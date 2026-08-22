"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FeedHorizontal from "@/components/FeedHorizontal";
import { auth } from "@/lib/auth";

// Blob serve api
const AVATAR_API = process.env.AVATAR_API || "http://localhost";

// ---------- Helpers ----------
function formatSubCount(subCount: number): string {
  if (!subCount) return "0 subscribers";
  if (subCount >= 1_000_000) return (subCount / 1_000_000).toFixed(1) + "M subscribers";
  if (subCount >= 1_000) return (subCount / 1_000).toFixed(1) + "K subscribers";
  return subCount + " subscribers";
}

function formatviews_count(views_count: number): string {
  if (views_count >= 1_000_000) return (views_count / 1_000_000).toFixed(1) + "M views";
  if (views_count >= 1_000) return (views_count / 1_000).toFixed(1) + "K views";
  return views_count + " views";
}

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

interface UserProfile {
  id: number;
  username: string;
  display_name: string;
  bio: string;
  avatar_path: string;
  role: string;
  is_verified: number;
  sub_count: number;
  created_at: string;
}

interface CommentUser {
  id: number;
  username: string;
  display_name: string;
  avatar_path: string | null;
}

interface CommentItem {
  id: string;
  video_id: string;
  comment: string;
  created_at: string;
  updated_at: string | null;
  user: CommentUser;
}

// ---------- Main Component ----------
export default function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");

  // Video and Channel States
  const [video, setVideo] = useState<Video | null>(null);
  const [channel, setChannel] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated user tracking
  const authUser = auth.getUser?.() as
    | { id?: string | number; username?: string; display_name?: string; avatar_path?: string }
    | null;

  // Interactive Action States
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isOwnChannel, setIsOwnChannel] = useState<boolean>(false);
  const [subCount, setSubCount] = useState<number>(0);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // When is being processing action
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);

  // Description toggle state
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  // Comments & Infinite Scroll States
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

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

  const [navbarBg, setNavbarBg] = useState("bg-transparent");
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewRecordedRef = useRef<boolean>(false);

  const [commentInput, setCommentInput] = useState("");
  const hasText = commentInput.trim().length > 0;

  const getThumbnailUrl = (path: string): string => {
    if (!path) return "/placeholder-thumbnail.jpg";
    if (path.startsWith("http")) return path;
    return `/api/thumbnail?path=${encodeURIComponent(path)}`;
  };

  const getAuthHeader = (): Record<string, string> => {
    const token = auth.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch Current User's Specific Video Interaction Status
  const fetchUserActivityStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/video/activity/status?videoId=${id}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setIsLiked(Boolean(data.isLiked));
      setIsSubscribed(Boolean(data.isSubscribed));
      setIsOwnChannel(Boolean(data.isOwnChannel));
    } catch (err) {
      console.error("Failed to fetch user activity status:", err);
    }
  }, []);

  // Action: Record Video View (with UI update)
  const handleRecordView = async () => {
    if (!videoId || viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    try {
      const res = await fetch("/api/video/activity/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ videoId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.counted === true) {
          setVideo((prev) =>
            prev ? { ...prev, views_count: prev.views_count + 1 } : null
          );
        }
      }
    } catch (e) {
      console.error("Failed to record view:", e);
    }
  };

  // Action: Toggle Like/Unlike
  const handleToggleLike = async () => {
    if (!videoId || isLiking) return; // prevent concurrent clicks

    setIsLiking(true);
    try {
      const res = await fetch("/api/video/activity/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ videoId }),
      });

      if (!res.ok) throw new Error("Like toggle failed");

      const newlyLiked = res.status === 201;
      setIsLiked(newlyLiked);
      setLikesCount((prev) => (newlyLiked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  // Action: Toggle Subscribe/Unsubscribe
  const handleToggleSubscribe = async () => {
    if (!channel?.id || isOwnChannel || isSubscribing) return;

    setIsSubscribing(true);
    try {
      const res = await fetch("/api/video/activity/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ userId: Number(channel.id) }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Subscription request failed:", errData.error || res.statusText);
        return;
      }

      const data = await res.json();
      if (typeof data.subscribed === "boolean") {
        setIsSubscribed(data.subscribed);
        setSubCount((prev) => (data.subscribed ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error("Failed to toggle subscribe:", err);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Action: Add Comment
  const handleAddComment = async () => {
    if (!videoId || !hasText || submittingComment) return;

    setSubmittingComment(true);
    const commentText = commentInput.trim();

    try {
      const res = await fetch("/api/video/activity/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ videoId, comment: commentText }),
      });

      if (!res.ok) throw new Error("Failed to add comment");
      const data = await res.json();

      const newCommentItem: CommentItem = {
        id: data.commentId,
        video_id: videoId,
        comment: commentText,
        created_at: new Date().toISOString(),
        updated_at: null,
        user: {
          id: Number(authUser?.id) || 0,
          username: authUser?.username || "You",
          display_name: authUser?.display_name || "You",
          avatar_path: authUser?.avatar_path || null,
        },
      };

      setComments((prev) => [newCommentItem, ...prev]);
      setCommentInput("");
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  useEffect(() => {
    if (!video) return;
    const thumbnailUrl = getThumbnailUrl(video.thumbnail_path);
    getDominantColor(thumbnailUrl)
      .then((color) => {
        setGlowColor(color);
        setRealtimeGlowColors({ c1: color, c2: color, c3: color });
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

  // Fetch Comments Function
  const fetchComments = useCallback(
    async (isInitial = false) => {
      if (!videoId || loadingComments || (!hasMore && !isInitial)) return;

      setLoadingComments(true);
      try {
        const cursorToUse = isInitial ? "" : nextCursor || "";
        const url = `/api/comments?video_id=${videoId}&limit=20${
          cursorToUse ? `&cursor=${encodeURIComponent(cursorToUse)}` : ""
        }`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load comments");

        const data = await res.json();

        setComments((prev) =>
          isInitial ? data.comments : [...prev, ...data.comments]
        );
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingComments(false);
      }
    },
    [videoId, nextCursor, hasMore, loadingComments]
  );

  // Initialize Comments on Video ID change
  useEffect(() => {
    if (videoId) {
      setComments([]);
      setNextCursor(null);
      setHasMore(true);
      viewRecordedRef.current = false;
      fetchComments(true);
    }
  }, [videoId]);

  // Infinite Scroll Observer Setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingComments) {
          fetchComments(false);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchComments, hasMore, loadingComments]);

  // Spatial color sampler
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
        const color1 = getRegionAvg(0, 0, 6, 6);
        const color2 = getRegionAvg(6, 0, 6, 6);
        const color3 = getRegionAvg(3, 6, 6, 6);

        setRealtimeGlowColors({ c1: color1, c2: color2, c3: color3 });
      } catch (e) {}

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

  const fetchChannelInfo = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/${userId}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.user) {
        setChannel(data.user);
        setSubCount(data.user.sub_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch channel info:", err);
    }
  };

  const fetchVideo = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/video/info?id=${id}`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }
      const data: Video = await res.json();
      setVideo(data);
      setLikesCount(data.likes_count || 0);

      if (data.user_id) {
        fetchChannelInfo(data.user_id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load video");
    }
  }, []);

  useEffect(() => {
    if (!videoId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all([fetchVideo(videoId), fetchUserActivityStatus(videoId)]).finally(
      () => setLoading(false)
    );
  }, [videoId, fetchVideo, fetchUserActivityStatus]);

  // Scroll effect for navbar background
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

  const videoUrl = `/api/video?id=${video.id}`;
  const channelName = channel?.display_name || channel?.username || "Unknown Channel";

  // Determine if description toggle should be shown
  const description = video.description || "No description";
  const showToggle = description.length >595;

  return (
    <div className="min-h-screen bg-canvas-subtle text-fg-default">
      <Navbar bg={navbarBg} />

      <main className="pt-[var(--header-height)] mt-2 w-full">
        <div className="mx-auto px-0 py-2 sm:px-2 sm:py-2 lg:px-3">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[70%] min-w-0 relative">
              <div ref={videoContainerRef} className="relative aspect-video">
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

                <div className="relative z-10 w-full h-full overflow-hidden rounded-none sm:rounded-xl">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    crossOrigin="anonymous"
                    onPlay={handleRecordView}
                    className="block w-full h-full object-contain bg-black"
                  />
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-1 py-2 px-3 sm:px-0">
                <h1 className="line-clamp-2 text-xl font-semibold text-fg-default leading-tight">
                  {video.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                  <div className="flex items-center gap-3">
                    <Link href={`/user/${video.user_id}`}>
                      {channel?.avatar_path ? (
                        <img
                          src={AVATAR_API + channel.avatar_path}
                          alt={channelName}
                          className="avatar avatar-sm md:w-[38px] md:h-[38px] object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent-muted flex items-center justify-center text-accent-fg font-bold text-sm">
                          {channelName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div>
                      <Link href={`/user/${video.user_id}`} className="no-underline">
                        <span className="text-fg-default text-base md:text-xl">{channelName}</span>
                        {channel?.is_verified === 1 && (
                          <svg
                            className="w-4 h-4 text-accent inline-block ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        )}
                      </Link>
                      <p className="text-xs md:text-sm text-fg-muted">
                        {formatSubCount(subCount)}
                      </p>
                    </div>

                    {/* Hide Subscribe Button on User's Own Channel */}
                    {!isOwnChannel && (
                      <button
                        onClick={handleToggleSubscribe}
                        disabled={isSubscribing}
                        className={`btn ${isSubscribed ? "btn-secondary" : "btn-primary"}`}
                        style={{ borderRadius: "50px" }}
                      >
                        {isSubscribing
                          ? "Subscribing..."
                          : isSubscribed
                          ? "Subscribed"
                          : "Subscribe"}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleLike}
                      disabled={isLiking}
                      className={`btn btn-secondary btn-is ${isLiked ? "text-accent" : ""}`}
                      style={{ borderRadius: "50px" }}
                    >
                      {isLiking ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                      ) : isLiked ? (
                          <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 -960 960 960"
                          fill="currentColor"
                        >
                          <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14ZM200-120H80v-520h120v520Z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 -960 960 960"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="50"
                        >
                          <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                        </svg>
                      )}
                      <span>{likesCount}</span>
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
                {/* Description with inline views/date and toggle */}
                <div className="mt-4 p-3 rounded-xl bg-canvas-subtle text-sm bg-canvas-elevated">
                  <div className="whitespace-pre-wrap text-fg-muted">
                    <span className="text-fg-default">
                      {formatviews_count(video.views_count || 0)} ○ {timeAgo(video.created_at)}
                      {description ? ' ' : ''}
                    </span>
                    <span>  </span>
                    {showToggle ? (
                      <>
                        {isDescriptionExpanded
                          ? description
                          : description.slice(0, 595)}
                        <button
                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                          className="seeMore text-fg-default hover:text-fg-muted"
                        >
                          {isDescriptionExpanded ? "  « See less" : ".....  See more »"}
                        </button>
                      </>
                    ) : (
                      description
                    )}
                  </div>
                </div>
              </div>

              {/* Real Comments Section */}
              <div className="py-2 border-t border-border-subtle pt-6 px-3 sm:px-0">
                <h2 className="text-lg font-semibold text-fg-default mb-4">
                  Comments {comments.length > 0 && `(${comments.length})`}
                </h2>

                <div className="flex items-end gap-3 mb-6 mt-4">
                  <textarea
                    className="add-comment-textarea text-base md:text-[1.2rem]"
                    rows={1}
                    placeholder="Add a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
                  {hasText && (
                    <button
                      onClick={handleAddComment}
                      disabled={submittingComment}
                      className="btn btn-primary"
                      style={{ borderRadius: "50px" }}
                    >
                      {submittingComment ? "Posting..." : "Comment"}
                    </button>
                  )}
                </div>

                <div className="space-y-4 flex flex-col gap-4">
                  {comments.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {item.user?.avatar_path ? (
                        <img
                          src={AVATAR_API + item.user.avatar_path}
                          alt={item.user.display_name || item.user.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent-muted text-accent-fg flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {(item.user?.display_name || item.user?.username || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-fg-default">
                            {item.user?.display_name || item.user?.username || "Anonymous"}
                          </span>
                          <span className="text-xs text-fg-muted">
                            {timeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-fg-default mt-0.5 leading-snug whitespace-pre-wrap">
                          {item.comment}
                        </p>

                        <div className="mt-1 flex items-center gap-4">
                          <button className="btn btn-ghost flex items-center gap-1 p-0 pr-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 -960 960 960"
                              fill="currentColor"
                            >
                              <path d="M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z" />
                            </svg>
                          </button>
                          <button className="btn btn-ghost text-xs">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!loadingComments && comments.length === 0 && (
                    <p className="text-fg-muted text-sm my-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}

                  <div ref={observerTarget} className="py-4 text-center">
                    {loadingComments && (
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                    )}
                    {!hasMore && comments.length > 0 && (
                      <p className="text-xs text-fg-muted mt-2">No more comments to show.</p>
                    )}
                  </div>
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