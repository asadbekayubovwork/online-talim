// Lessons are temporarily sourced from YouTube links instead of uploaded videos.
// The backend stores a canonical watch URL; these helpers parse it for playback.

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const PATH_PREFIXES = ["embed", "shorts", "live", "v"];

/** Video id of any supported YouTube link, or null when the value is not one. */
export function extractYoutubeId(value?: string | null): string | null {
  const candidate = (value ?? "").trim();
  if (!candidate) return null;
  if (YOUTUBE_ID_PATTERN.test(candidate)) return candidate;
  let url: URL;
  try {
    url = new URL(candidate.includes("//") ? candidate : `https://${candidate}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  let id = "";
  if (host === "youtu.be" || host === "www.youtu.be") {
    id = segments[0] ?? "";
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname === "/watch" || url.pathname === "/watch/") id = url.searchParams.get("v") ?? "";
    else if (segments.length >= 2 && PATH_PREFIXES.includes(segments[0])) id = segments[1];
  }
  return YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

export function isYoutubeLink(value?: string | null): boolean {
  return extractYoutubeId(value) !== null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
