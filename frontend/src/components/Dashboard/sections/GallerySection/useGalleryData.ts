import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../../../../utils/api";
import type { GalleryPhotoRow, GalleryVideoRow } from "./types";

export function useGalleryData() {
  const [photos, setPhotos] = useState<GalleryPhotoRow[]>([]);
  const [videos, setVideos] = useState<GalleryVideoRow[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const fetchPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      const res = await apiFetch("/api/dashboard/gallery/photos");
      if (res.ok) {
        const list = await res.json();
        setPhotos(Array.isArray(list) ? list : []);
      }
    } catch {
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const res = await apiFetch("/api/dashboard/gallery/videos");
      if (res.ok) {
        const list = await res.json();
        setVideos(Array.isArray(list) ? list : []);
      }
    } catch {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetchVideos();
  }, [fetchPhotos, fetchVideos]);

  return {
    photos,
    setPhotos,
    videos,
    setVideos,
    loadingPhotos,
    loadingVideos,
    fetchPhotos,
    fetchVideos,
  };
}
