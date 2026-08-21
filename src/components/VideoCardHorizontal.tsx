// src/components/VideoCardHorizontal.tsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

type VideoCardProps = {
  thumbnail: string;
  title: string;
  channelName: string;
  avatar: string;
  views_count: string;
  isVerified: boolean;
  published: string;
  duration: string;
};

export default function VideoCardHorizontal({
  thumbnail,
  title,
  channelName,
  avatar,
  views_count,
  isVerified,
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
        // A 1x1 canvas automatically computes the average color of the image
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1, 1);
          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
          // Apply a subtle gradient background using the extracted color
          setHoverBg(`linear-gradient(90deg, rgba(${r},${g},${b},0.15) 0%, rgba(${r},${g},${b},0.05) 100%)`);
        }
      } catch (e) {
        // Fallback for strict CORS environments
        setHoverBg("rgba(255, 255, 255, 0.05)");
      }
    };
  }, [thumbnail]);

  return (
    <article className="group relative w-full cursor-pointer flex gap-2 rounded-xl p-2 transition-all duration-300">
      {/* Dynamic Hover Background Layer */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 scale-95 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-100 z-0"
        style={{ background: hoverBg }}
      />

      {/* Thumbnail */}
      <div className="relative w-[310px] min-w-[168px] flex-shrink-0 aspect-video rounded-xl overflow-hidden bg-canvas-subtle z-10">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover"
        />
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-[12px] font-medium text-white leading-none tracking-wide">
          {duration}
        </span>
      </div>

      {/* Metadata */}
      <div className="flex-1 min-w-0 flex flex-col justify-start pt-0.5 z-10">
        <h3 
          className="line-clamp-2 text-[14px] font-semibold leading-tight text-fg-default mb-1" 
          title={title}
        >
          {title}
        </h3>
        <div className="flex flex-col">
          <p className="text-[12px] text-fg-muted truncate mt-[1px]">
            {views_count} • {published}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="avatar avatar-sm">{avatar}</div>
            <p className="text-[12px] text-fg-muted truncate hover:text-fg-default transition-colors">
              {channelName}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}