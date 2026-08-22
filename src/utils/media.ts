// src/utils/media.ts

/**
 * Encodes and formats avatar path to route through the Next.js API proxy
 */
export function getAvatarUrl(path: string | null | undefined): string {
  if (!path) return "/avatar-placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api/avatar?path=${encodeURIComponent(path)}`;
}

/**
 * Encodes and formats thumbnail path to route through the Next.js API proxy
 */
export function getThumbnailUrl(path: string | null | undefined): string {
  if (!path) return "/image-placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/api/thumbnail?path=${encodeURIComponent(path)}`;
}