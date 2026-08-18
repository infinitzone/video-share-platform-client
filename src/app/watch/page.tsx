"use client";

import { useSearchParams } from "next/navigation";

export default function WatchPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get("v");

  const getVideoUrl = (id: string): string => {
    return `http://localhost/watch/${id}`;
  };

  if (!videoId) {
    return <p>No video ID provided.</p>;
  }

  return (
    <div>

      <video
        src={getVideoUrl(videoId)}
        controls
        playsInline
        preload="metadata"
      />
    </div>
  );
}   