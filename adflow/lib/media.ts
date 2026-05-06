import { PLACEHOLDER_IMAGE } from "@/lib/constants";

const imagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)$/i;
const youtubePattern =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function normalizeMedia(url: string) {
  const trimmed = url.trim();

  if (imagePattern.test(trimmed)) {
    return { mediaType: "image" as const, mediaUrl: trimmed, thumbnailUrl: trimmed };
  }

  const youtubeMatch = trimmed.match(youtubePattern);
  if (youtubeMatch) {
    const videoId = youtubeMatch[4];
    return {
      mediaType: "youtube" as const,
      mediaUrl: trimmed,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      videoId,
    };
  }

  return {
    mediaType: "image" as const,
    mediaUrl: PLACEHOLDER_IMAGE,
    thumbnailUrl: PLACEHOLDER_IMAGE,
    fallback: true,
  };
}

export function isValidMediaUrl(url: string) {
  return imagePattern.test(url) || youtubePattern.test(url);
}

