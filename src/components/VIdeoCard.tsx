"use client";
import Image from "next/image";
type VideoCardProps = {
  thumbnail: string;
  avatar: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  duration: string;
};
export default function VideoCard({
  thumbnail,
  avatar,
  title,
  channel,
  views,
  published,
  duration,
}: VideoCardProps) {
  return (
    <article className="group w-full cursor-pointer p-4 rounded-4 hover:bg-canvas-inset">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3 bg-canvas-subtle">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-fast"
        />
        {/* Duration */}
        <span className="absolute bottom-2 right-2 rounded-1 bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {duration}
        </span>
      </div>
      {/* Information */}
      <div className="mt-3 flex gap-3">
        {/* You can add avatar here if needed */}
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-fg-default">
            {title}
          </h3>
          <p className="text-xs text-fg-muted mt-1 hidden">{channel}</p>
          <p className="text-xs text-fg-muted hidden">{views} • {published}</p>
        </div>
      </div>
    </article>
  );
}