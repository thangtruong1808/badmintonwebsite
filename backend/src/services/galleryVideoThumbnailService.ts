import { v2 as cloudinary } from 'cloudinary';
import { parseVideoId } from '../utils/youtube.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER = 'chibibadminton/gallery-videos';

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload an image from a URL (e.g. YouTube thumbnail or pasted URL) to Cloudinary.
 * Returns the Cloudinary secure_url, or null if upload fails or Cloudinary is not configured.
 */
export async function uploadThumbnailFromUrl(imageUrl: string): Promise<string | null> {
  if (!imageUrl || !imageUrl.startsWith('http')) return null;
  if (!isCloudinaryConfigured()) return null;

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: FOLDER,
      public_id: `video_thumb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      // No transformation: store as-is so full thumbnail content (title/text) is preserved.
    });
    return result?.secure_url ?? null;
  } catch {
    return null;
  }
}

/**
 * Resolve thumbnail URL for a gallery video:
 * - If thumbnailUrl is provided and valid, upload it to Cloudinary and return the result.
 * - Else if embed_id contains a video ID, use img.youtube.com/vi/{id}/hqdefault.jpg and upload.
 * - Else return null.
 */
export async function resolveVideoThumbnail(
  embedId: string,
  category: string,
  thumbnailUrlFromRequest: string | undefined | null
): Promise<string | null> {
  if (thumbnailUrlFromRequest && thumbnailUrlFromRequest.trim().startsWith('http')) {
    const uploaded = await uploadThumbnailFromUrl(thumbnailUrlFromRequest.trim());
    if (uploaded) return uploaded;
  }

  const videoId = parseVideoId(embedId);
  if (!videoId) return null;

  // Prefer 16:9 high-res (1280x720) so title/text aren't cropped; fallback to hqdefault (480x360).
  const maxResUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const uploaded = await uploadThumbnailFromUrl(maxResUrl);
  if (uploaded) return uploaded;
  const hqUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  return uploadThumbnailFromUrl(hqUrl);
}
