import React, { useState } from "react";
import ConfirmDialog from "../../Shared/ConfirmDialog";
import { apiFetch } from "../../../../utils/api";
import { useGalleryData } from "./useGalleryData";
import { PhotoFormModal } from "./PhotoFormModal";
import { VideoFormModal } from "./VideoFormModal";
import { PhotosTabPanel, VideosTabPanel } from "./GalleryTabPanel";
import {
  PHOTO_TYPE_OPTIONS,
  type GalleryPhotoRow,
  type GalleryVideoRow,
  type PhotoFormData,
  type VideoFormData,
} from "./types";

type GalleryTab = "photos" | "videos";

const DEFAULT_PHOTO_FORM: PhotoFormData = {
  src: "",
  alt: "",
  type: "chibi-tournament",
  display_order: 0,
};

const DEFAULT_VIDEO_FORM: VideoFormData = {
  title: "",
  embed_id: "",
  thumbnail: "",
  category: "Wednesday",
  display_order: 0,
};

const GallerySection: React.FC = () => {
  const [tab, setTab] = useState<GalleryTab>("photos");
  const {
    photos,
    setPhotos,
    videos,
    setVideos,
    loadingPhotos,
    loadingVideos,
  } = useGalleryData();

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhotoRow | null>(null);
  const [editingVideo, setEditingVideo] = useState<GalleryVideoRow | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<GalleryPhotoRow | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<GalleryVideoRow | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState<PhotoFormData>(DEFAULT_PHOTO_FORM);
  const [videoForm, setVideoForm] = useState<VideoFormData>(DEFAULT_VIDEO_FORM);

  const openPhotoCreate = () => {
    setEditingPhoto(null);
    setPhotoUploadError(null);
    setPhotoForm(DEFAULT_PHOTO_FORM);
    setPhotoModalOpen(true);
  };

  const openPhotoEdit = (row: GalleryPhotoRow) => {
    setEditingPhoto(row);
    setPhotoUploadError(null);
    const type = PHOTO_TYPE_OPTIONS.some((o) => o.value === row.type)
      ? row.type
      : "chibi-tournament";
    setPhotoForm({
      src: row.src,
      alt: row.alt,
      type,
      display_order: row.display_order,
    });
    setPhotoModalOpen(true);
  };

  const handlePhotoSuccess = (photo: GalleryPhotoRow) => {
    if (editingPhoto) {
      setPhotos((prev) =>
        prev.map((p) => (p.id === editingPhoto.id ? photo : p))
      );
    } else {
      setPhotos((prev) => [photo, ...prev]);
    }
  };

  const handlePhotoDelete = async (row: GalleryPhotoRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/gallery/photos/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== row.id));
    } catch {
      // keep dialog open
    }
    setDeletePhoto(null);
  };

  const openVideoCreate = () => {
    setEditingVideo(null);
    setVideoForm(DEFAULT_VIDEO_FORM);
    setVideoModalOpen(true);
  };

  const openVideoEdit = (row: GalleryVideoRow) => {
    setEditingVideo(row);
    const youtubeUrl =
      /^https?:\/\//.test(row.embed_id)
        ? row.embed_id
        : `https://www.youtube.com/watch?v=${row.embed_id}`;
    setVideoForm({
      title: row.title,
      embed_id: youtubeUrl,
      thumbnail: row.thumbnail ?? "",
      category: row.category,
      display_order: row.display_order,
    });
    setVideoModalOpen(true);
  };

  const handleVideoSuccess = (video: GalleryVideoRow) => {
    if (editingVideo) {
      setVideos((prev) =>
        prev.map((v) => (v.id === editingVideo.id ? video : v))
      );
    } else {
      setVideos((prev) => [video, ...prev]);
    }
  };

  const handleVideoDelete = async (row: GalleryVideoRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/gallery/videos/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) setVideos((prev) => prev.filter((v) => v.id !== row.id));
    } catch {
      // keep dialog open
    }
    setDeleteVideo(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab("photos")}
          className={`border-b-2 px-4 py-2 font-calibri text-sm ${
            tab === "photos"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-gray-600 hover:text-rose-600"
          }`}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setTab("videos")}
          className={`border-b-2 px-4 py-2 font-calibri text-sm ${
            tab === "videos"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-gray-600 hover:text-rose-600"
          }`}
        >
          Videos
        </button>
      </div>

      {tab === "photos" && (
        <PhotosTabPanel
          loading={loadingPhotos}
          photos={photos}
          onAdd={openPhotoCreate}
          onEdit={openPhotoEdit}
          onDelete={setDeletePhoto}
        />
      )}
      {tab === "videos" && (
        <VideosTabPanel
          loading={loadingVideos}
          videos={videos}
          onAdd={openVideoCreate}
          onEdit={openVideoEdit}
          onDelete={setDeleteVideo}
        />
      )}

      <PhotoFormModal
        open={photoModalOpen}
        editing={editingPhoto}
        form={photoForm}
        onFormChange={setPhotoForm}
        onClose={() => setPhotoModalOpen(false)}
        onSuccess={handlePhotoSuccess}
        uploading={photoUploading}
        uploadError={photoUploadError}
        onUploadingChange={setPhotoUploading}
        onUploadErrorChange={setPhotoUploadError}
      />

      <VideoFormModal
        open={videoModalOpen}
        editing={editingVideo}
        form={videoForm}
        onFormChange={setVideoForm}
        onClose={() => setVideoModalOpen(false)}
        onSuccess={handleVideoSuccess}
      />

      <ConfirmDialog
        open={!!deletePhoto}
        title="Delete Photo"
        message={deletePhoto ? "Delete this photo? This cannot be undone." : ""}
        confirmLabel="Delete"
        onConfirm={() => deletePhoto && handlePhotoDelete(deletePhoto)}
        onCancel={() => setDeletePhoto(null)}
      />
      <ConfirmDialog
        open={!!deleteVideo}
        title="Delete Video"
        message={deleteVideo ? "Delete this video? This cannot be undone." : ""}
        confirmLabel="Delete"
        onConfirm={() => deleteVideo && handleVideoDelete(deleteVideo)}
        onCancel={() => setDeleteVideo(null)}
      />
    </div>
  );
};

export default GallerySection;
export type { GalleryPhotoRow, GalleryVideoRow };
