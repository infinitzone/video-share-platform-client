// src/components/VideoCardHorizontal.tsx
"use client";
import Image from "next/image";

type VideoCardProps = {
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  duration: string;
};

export default function VideoCardHorizontal({
  thumbnail,
  title,
  channel,
  views,
  published,
  duration,
}: VideoCardProps) {
  return (
    <article className="group w-full cursor-pointer rounded-xl hover:bg-canvas-inset transition-colors p-2">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-canvas-subtle">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-fast group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-fg-default group-hover:text-accent">
            {title}
          </h3>
          <div className="mt-1 space-y-0.5">
            <p className="text-xs text-fg-muted truncate">{channel}</p>
            <p className="text-xs text-fg-muted">
              {views} • {published}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}