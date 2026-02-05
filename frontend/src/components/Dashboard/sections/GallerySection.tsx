import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, Select, FormActions } from "../Shared/inputs";
import { apiFetch, API_BASE } from "../../../utils/api";

type GalleryTab = "photos" | "videos";

export interface GalleryPhotoRow {
  id: number;
  src: string;
  alt: string;
  type: string;
  display_order: number;
  created_at?: string;
}

export interface GalleryVideoRow {
  id: number;
  title: string;
  embed_id: string;
  thumbnail?: string;
  category: string;
  display_order: number;
  created_at?: string;
}

const PHOTO_TYPE_OPTIONS = [
  { value: "chibi-tournament", label: "Chibi Tournament" },
  { value: "veteran-tournament", label: "Veteran Tournament" },
];

const VIDEO_CATEGORY_OPTIONS = [
  { value: "Wednesday", label: "Wednesday" },
  { value: "Friday", label: "Friday" },
  { value: "tournament", label: "Tournament" },
  { value: "playlists", label: "Playlists" },
];

const PHOTO_COLUMNS: Column<GalleryPhotoRow>[] = [
  { key: "id", label: "ID" },
  { key: "src", label: "Src", render: (r) => r.src.slice(0, 30) + "…" },
  { key: "alt", label: "Alt" },
  { key: "type", label: "Type" },
  { key: "display_order", label: "Order" },
];

const VIDEO_COLUMNS: Column<GalleryVideoRow>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "embed_id", label: "Embed ID" },
  { key: "category", label: "Category" },
  { key: "display_order", label: "Order" },
];

const GallerySection: React.FC = () => {
  const [tab, setTab] = useState<GalleryTab>("photos");
  const [photos, setPhotos] = useState<GalleryPhotoRow[]>([]);
  const [videos, setVideos] = useState<GalleryVideoRow[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhotoRow | null>(null);
  const [editingVideo, setEditingVideo] = useState<GalleryVideoRow | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<GalleryPhotoRow | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<GalleryVideoRow | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [photoForm, setPhotoForm] = useState({
    src: "",
    alt: "",
    type: "chibi-tournament",
    display_order: 0,
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    embed_id: "",
    thumbnail: "",
    category: "Wednesday",
    display_order: 0,
  });

  const fetchPhotos = async () => {
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
  };

  const fetchVideos = async () => {
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
  };

  useEffect(() => {
    fetchPhotos();
    fetchVideos();
  }, []);

  const openPhotoCreate = () => {
    setEditingPhoto(null);
    setPhotoUploadError(null);
    setPhotoForm({ src: "", alt: "", type: "chibi-tournament", display_order: 0 });
    setPhotoModalOpen(true);
  };

  const uploadGalleryPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setPhotoUploadError("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadError("Image size must be less than 5MB.");
      return;
    }
    setPhotoUploadError(null);
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload/gallery-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setPhotoForm((f) => ({ ...f, src: data.url }));
    } catch (err) {
      setPhotoUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setPhotoUploading(false);
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    }
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadGalleryPhoto(file);
  };
  const openPhotoEdit = (row: GalleryPhotoRow) => {
    setEditingPhoto(row);
    setPhotoUploadError(null);
    const type = PHOTO_TYPE_OPTIONS.some((o) => o.value === row.type) ? row.type : "chibi-tournament";
    setPhotoForm({
      src: row.src,
      alt: row.alt,
      type,
      display_order: row.display_order,
    });
    setPhotoModalOpen(true);
  };
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.src?.trim()) {
      setPhotoUploadError("Please upload a photo.");
      return;
    }
    setPhotoUploadError(null);
    try {
      if (editingPhoto) {
        const res = await apiFetch(`/api/dashboard/gallery/photos/${editingPhoto.id}`, {
          method: "PUT",
          body: JSON.stringify(photoForm),
        });
        if (!res.ok) return;
        const updated = await res.json();
        setPhotos((prev) =>
          prev.map((p) => (p.id === editingPhoto.id ? updated : p))
        );
      } else {
        const res = await apiFetch("/api/dashboard/gallery/photos", {
          method: "POST",
          body: JSON.stringify(photoForm),
        });
        if (!res.ok) return;
        const created = await res.json();
        setPhotos((prev) => [created, ...prev]);
      }
      setPhotoModalOpen(false);
    } catch {
      // keep modal open
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
    setVideoForm({
      title: "",
      embed_id: "",
      thumbnail: "",
      category: "Wednesday",
      display_order: 0,
    });
    setVideoModalOpen(true);
  };
  const openVideoEdit = (row: GalleryVideoRow) => {
    setEditingVideo(row);
    setVideoForm({
      title: row.title,
      embed_id: row.embed_id,
      thumbnail: row.thumbnail ?? "",
      category: row.category,
      display_order: row.display_order,
    });
    setVideoModalOpen(true);
  };
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...videoForm,
        thumbnail: videoForm.thumbnail || undefined,
      };
      if (editingVideo) {
        const res = await apiFetch(`/api/dashboard/gallery/videos/${editingVideo.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const updated = await res.json();
        setVideos((prev) =>
          prev.map((v) => (v.id === editingVideo.id ? updated : v))
        );
      } else {
        const res = await apiFetch("/api/dashboard/gallery/videos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const created = await res.json();
        setVideos((prev) => [created, ...prev]);
      }
      setVideoModalOpen(false);
    } catch {
      // keep modal open
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
          className={`border-b-2 px-4 py-2 font-calibri text-sm ${tab === "photos"
            ? "border-rose-500 text-rose-600"
            : "border-transparent text-gray-600 hover:text-rose-600"
            }`}
        >
          Photos
        </button>
        <button
          type="button"
          onClick={() => setTab("videos")}
          className={`border-b-2 px-4 py-2 font-calibri text-sm ${tab === "videos"
            ? "border-rose-500 text-rose-600"
            : "border-transparent text-gray-600 hover:text-rose-600"
            }`}
        >
          Videos
        </button>
      </div>
      {tab === "photos" && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openPhotoCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
            >
              <FaPlus size={16} />
              Add Photo
            </button>
          </div>
          {loadingPhotos ? (
            <p className="font-calibri text-gray-600">Loading...</p>
          ) : (
            <DataTable
              columns={PHOTO_COLUMNS}
              data={photos}
              getRowId={(r) => r.id}
              onEdit={openPhotoEdit}
              onDelete={(r) => setDeletePhoto(r)}
              emptyMessage="No photos yet. Click Add Photo to create one."
            />
          )}
        </>
      )}
      {tab === "videos" && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openVideoCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
            >
              <FaPlus size={16} />
              Add Video
            </button>
          </div>
          {loadingVideos ? (
            <p className="font-calibri text-gray-600">Loading...</p>
          ) : (
            <DataTable
              columns={VIDEO_COLUMNS}
              data={videos}
              getRowId={(r) => r.id}
              onEdit={openVideoEdit}
              onDelete={(r) => setDeleteVideo(r)}
              emptyMessage="No videos yet. Click Add Video to create one."
            />
          )}
        </>
      )}
      <FormModal
        title={editingPhoto ? "Edit Photo" : "Add Photo"}
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onSubmit={handlePhotoSubmit}
        maxWidth="2xl"
      >
        <div className="space-y-2">
          <label className="block font-calibri text-sm font-medium text-gray-700">
            Photo
          </label>
          <input
            ref={photoFileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileSelect}
            className="hidden"
            aria-label="Upload gallery photo"
          />
          {photoForm.src ? (
            <div className="relative rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
              <img
                src={photoForm.src}
                alt={photoForm.alt || "Preview"}
                className="w-full h-40 sm:h-48 object-contain"
              />
              <button
                type="button"
                onClick={() => setPhotoForm((f) => ({ ...f, src: "" }))}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                aria-label="Remove photo"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoFileInputRef.current?.click()}
              disabled={photoUploading}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (photoUploading) return;
                const file = e.dataTransfer.files?.[0];
                if (file && file.type.startsWith("image/")) uploadGalleryPhoto(file);
              }}
              className="w-full min-h-[120px] sm:min-h-[140px] rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {photoUploading ? (
                <>
                  <span className="animate-pulse text-rose-500">
                    <FaCloudUploadAlt size={28} />
                  </span>
                  <span className="text-sm font-calibri text-gray-600">Uploading…</span>
                </>
              ) : (
                <>
                  <FaImage className="text-gray-400" size={28} />
                  <span className="text-sm font-calibri text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs font-calibri text-gray-500">
                    PNG, JPG up to 5MB
                  </span>
                </>
              )}
            </button>
          )}
          {photoUploadError && (
            <p className="text-sm text-red-600 font-calibri">{photoUploadError}</p>
          )}
        </div>
        <TextInput
          label="Alt"
          name="alt"
          value={photoForm.alt}
          onChange={(e) => setPhotoForm((f) => ({ ...f, alt: e.target.value }))}
          required
        />
        <Select
          label="Type"
          name="type"
          value={photoForm.type}
          onChange={(e) => setPhotoForm((f) => ({ ...f, type: e.target.value }))}
          options={PHOTO_TYPE_OPTIONS}
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={photoForm.display_order}
          onChange={(e) =>
            setPhotoForm((f) => ({
              ...f,
              display_order: Number(e.target.value) || 0,
            }))
          }
        />
        <FormActions onCancel={() => setPhotoModalOpen(false)} />
      </FormModal>
      <FormModal
        title={editingVideo ? "Edit Video" : "Add Video"}
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onSubmit={handleVideoSubmit}
      >
        <TextInput
          label="Title"
          name="title"
          value={videoForm.title}
          onChange={(e) => setVideoForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <TextInput
          label="Embed ID"
          name="embed_id"
          value={videoForm.embed_id}
          onChange={(e) =>
            setVideoForm((f) => ({ ...f, embed_id: e.target.value }))
          }
          required
        />
        <TextInput
          label="Thumbnail URL"
          name="thumbnail"
          value={videoForm.thumbnail}
          onChange={(e) =>
            setVideoForm((f) => ({ ...f, thumbnail: e.target.value }))
          }
        />
        <Select
          label="Category"
          name="category"
          value={videoForm.category}
          onChange={(e) =>
            setVideoForm((f) => ({ ...f, category: e.target.value }))
          }
          options={VIDEO_CATEGORY_OPTIONS}
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={videoForm.display_order}
          onChange={(e) =>
            setVideoForm((f) => ({
              ...f,
              display_order: Number(e.target.value) || 0,
            }))
          }
        />
        <FormActions onCancel={() => setVideoModalOpen(false)} />
      </FormModal>
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
