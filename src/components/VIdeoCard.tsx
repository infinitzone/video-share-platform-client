"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type VideoCardProps = {
  thumbnail: string;
  avatar: string;
  title: string;
  channel: string;
  views_count: string;
  published: string;
  duration: string;
};

export default function VideoCard({
  thumbnail,
  avatar,
  title,
  channel,
  views_count,
  published,
  duration,
}: VideoCardProps) {
  const [hoverBg, setHoverBg] = useState<string>("transparent");

  useEffect(() => {
    if (!thumbnail) return;
    
    // Create an image object to extract the dominant/average color
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
          // Apply a vertical gradient background using the extracted color
          setHoverBg(`linear-gradient(180deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.05) 100%)`);
        }
      } catch (e) {
        // Fallback for strict CORS environments
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
          src={thumbnail}
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
      <div className="flex gap-3 pr-6 z-10">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="avatar">
            {avatar}
          </div>
        </div>
        
        {/* Text Details */}
        <div className="flex flex-col min-w-0">
          <h3 className="line-clamp-2 text-base text-fg-default">
            {title}
          </h3>
          <p className="text-sm text-fg-muted transition-colors">
            {channel}
          </p>
          <p className="text-sm text-fg-muted">
            {views_count} • {published}
          </p>
        </div>
      </div>
    </article>
  );
}