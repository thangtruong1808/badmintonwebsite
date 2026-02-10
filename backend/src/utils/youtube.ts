/**
 * Extract YouTube video ID from URL or raw ID (for backend use).
 */
export function parseVideoId(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed) return '';
  if (/^[\w-]{10,12}$/.test(trimmed) && !trimmed.startsWith('PL')) return trimmed;
  const watch = trimmed.match(/[?&]v=([\w-]{10,12})/);
  if (watch) return watch[1];
  const short = trimmed.match(/youtu\.be\/([\w-]{10,12})/);
  if (short) return short[1];
  const embed = trimmed.match(/youtube\.com\/embed\/([\w-]{10,12})/);
  if (embed) return embed[1];
  const v = trimmed.match(/youtube\.com\/v\/([\w-]{10,12})/);
  if (v) return v[1];
  return '';
}
