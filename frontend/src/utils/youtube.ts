/**
 * Extract YouTube video ID from URL. When URL has both v= and list=, returns video ID.
 */
export function parseVideoId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^[\w-]{10,12}$/.test(trimmed) && !trimmed.startsWith("PL")) return trimmed;
  const watch = trimmed.match(/[?&]v=([\w-]{10,12})/);
  if (watch) return watch[1];
  const short = trimmed.match(/youtu\.be\/([\w-]{10,12})/);
  if (short) return short[1];
  const embed = trimmed.match(/youtube\.com\/embed\/([\w-]{10,12})/);
  if (embed) return embed[1];
  const v = trimmed.match(/youtube\.com\/v\/([\w-]{10,12})/);
  if (v) return v[1];
  return "";
}

/**
 * Extract YouTube playlist ID from URL. When URL has both v= and list=, returns playlist ID.
 */
export function parsePlaylistIdFromUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^PL[\w-]{10,35}$/.test(trimmed)) return trimmed;
  const list = trimmed.match(/[?&]list=([\w-]+)/);
  if (list) return list[1];
  return "";
}

/**
 * Extract YouTube video ID or playlist ID from URL based on prefer.
 * When URL has both v= and list=, returns the preferred one.
 * When only one type exists, returns it only if it matches prefer.
 */
export function parseYouTubeId(
  input: string,
  prefer: "video" | "playlist" = "playlist"
): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const videoId = parseVideoId(trimmed);
  const playlistId = parsePlaylistIdFromUrl(trimmed);
  if (prefer === "video") return videoId || "";
  if (prefer === "playlist") return playlistId || "";
  return videoId || playlistId || "";
}

/**
 * Returns true if the ID is a playlist ID (e.g. PLxxx).
 */
export function isPlaylistId(id: string): boolean {
  return id.startsWith("PL") || id.startsWith("UU") || id.startsWith("FL");
}
