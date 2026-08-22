// src/components/VideoCard.tsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type VideoCardProps = {
  thumbnail: string;
  avatar: string;
  title: string;
  channelName: string;
  views_count: string;
  isVerified: boolean;
  published: string;
  duration: string;
};

export default function VideoCard({
  thumbnail,
  avatar,
  title,
  channelName,
  views_count,
  isVerified,
  published,
  duration,
}: VideoCardProps) {
  const [hoverBg, setHoverBg] = useState<string>("transparent");

  useEffect(() => {
    if (!thumbnail) return;
    
    const img = new window.Image();
    img.crossOrigin = "Anonymous"; 
    img.src = thumbnail;
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          setHoverBg(`linear-gradient(180deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.05) 100%)`);
        }
      } catch (e) {
        setHoverBg("rgba(255, 255, 255, 0.05)");
      }
    };
  }, [thumbnail]);

  return (
    <article className="group relative w-full cursor-pointer flex flex-col gap-3 p-3 rounded-2xl transition-all duration-300">
      {/* Dynamic Hover Background Layer */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 scale-95 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 z-0"
        style={{ background: hoverBg }}
      />

      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-canvas-subtle z-10">
        <Image
          src={thumbnail? thumbnail : "/image-placeholder.png"}
          alt={title}
          fill
          unoptimized
          className="object-cover"
        />
        {/* Duration */}
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {duration}
        </span>
      </div>
      
      {/* Information Row */}
      <div className="flex flex-col gap-2 pr-2 z-10">
        {/* Video title */}
        <h3 className="line-clamp-2 text-base font-semibold text-fg-default leading-snug">
            {title}
        </h3>

      {/* Channel avatar */}
        <div className="flex gap-2 items-center min-w-0">
        <div className="flex-shrink-0 mt-0.5">
          <div>
            <img
              src={avatar? avatar : "/avatar-placeholder.png"}
              alt={channelName}
              className="avatar avatar-sm"
            />
          </div>
        </div>
        {/* Channel text details */}
        <div className="">
          <p className="text-sm text-fg-muted transition-colors flex items-center gap-1 mt-1">
            <span className="truncate">{channelName}</span>
            {isVerified && (
              <svg
                className="w-3.5 h-3.5 text-accent fill-current flex-shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </p>
          <p className="text-sm text-fg-muted">
            {views_count} • {published}
          </p>
        </div>

        </div>
      </div>
    </article>
  );
}