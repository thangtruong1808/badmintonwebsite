import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, Select, FormActions } from "../Shared/inputs";

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
  { value: "social", label: "Social" },
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
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhotoRow | null>(null);
  const [editingVideo, setEditingVideo] = useState<GalleryVideoRow | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<GalleryPhotoRow | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<GalleryVideoRow | null>(null);
  const [photoForm, setPhotoForm] = useState({
    src: "",
    alt: "",
    type: "social",
    display_order: 0,
  });
  const [videoForm, setVideoForm] = useState({
    title: "",
    embed_id: "",
    thumbnail: "",
    category: "Wednesday",
    display_order: 0,
  });

  const openPhotoCreate = () => {
    setEditingPhoto(null);
    setPhotoForm({ src: "", alt: "", type: "social", display_order: 0 });
    setPhotoModalOpen(true);
  };
  const openPhotoEdit = (row: GalleryPhotoRow) => {
    setEditingPhoto(row);
    setPhotoForm({
      src: row.src,
      alt: row.alt,
      type: row.type,
      display_order: row.display_order,
    });
    setPhotoModalOpen(true);
  };
  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPhoto) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === editingPhoto.id ? { ...p, ...photoForm } : p
        )
      );
    } else {
      const newId = photos.length ? Math.max(...photos.map((p) => p.id)) + 1 : 1;
      setPhotos((prev) => [...prev, { id: newId, ...photoForm }]);
    }
    setPhotoModalOpen(false);
  };
  const handlePhotoDelete = (row: GalleryPhotoRow) => {
    setPhotos((prev) => prev.filter((p) => p.id !== row.id));
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
  const handleVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideo) {
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id ? { ...v, ...videoForm } : v
        )
      );
    } else {
      const newId = videos.length ? Math.max(...videos.map((v) => v.id)) + 1 : 1;
      setVideos((prev) => [...prev, { id: newId, ...videoForm }]);
    }
    setVideoModalOpen(false);
  };
  const handleVideoDelete = (row: GalleryVideoRow) => {
    setVideos((prev) => prev.filter((v) => v.id !== row.id));
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
          <DataTable
            columns={PHOTO_COLUMNS}
            data={photos}
            getRowId={(r) => r.id}
            onEdit={openPhotoEdit}
            onDelete={(r) => setDeletePhoto(r)}
            emptyMessage="No photos yet. Click Add Photo to create one."
          />
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
          <DataTable
            columns={VIDEO_COLUMNS}
            data={videos}
            getRowId={(r) => r.id}
            onEdit={openVideoEdit}
            onDelete={(r) => setDeleteVideo(r)}
            emptyMessage="No videos yet. Click Add Video to create one."
          />
        </>
      )}
      <FormModal
        title={editingPhoto ? "Edit Photo" : "Add Photo"}
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onSubmit={handlePhotoSubmit}
      >
        <TextInput
          label="Src (URL)"
          name="src"
          value={photoForm.src}
          onChange={(e) => setPhotoForm((f) => ({ ...f, src: e.target.value }))}
          required
        />
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
