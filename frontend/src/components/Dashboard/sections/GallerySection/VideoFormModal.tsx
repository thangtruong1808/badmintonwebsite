import React, { useEffect } from "react";
import FormModal from "../../Shared/FormModal";
import { TextInput, NumberInput, Select, FormActions } from "../../Shared/inputs";
import { apiFetch } from "../../../../utils/api";
import {
  parseYouTubeId,
  parseVideoId,
  parsePlaylistIdFromUrl,
} from "../../../../utils/youtube";
import type { GalleryVideoRow, VideoFormData } from "./types";
import { VIDEO_CATEGORY_OPTIONS } from "./types";

interface VideoFormModalProps {
  open: boolean;
  editing: GalleryVideoRow | null;
  form: VideoFormData;
  onFormChange: (updater: (prev: VideoFormData) => VideoFormData) => void;
  onClose: () => void;
  onSuccess: (video: GalleryVideoRow) => void;
}

export const VideoFormModal: React.FC<VideoFormModalProps> = ({
  open,
  editing,
  form,
  onFormChange,
  onClose,
  onSuccess,
}) => {
  const [urlError, setUrlError] = React.useState<string | null>(null);

  useEffect(() => {
    if (open) setUrlError(null);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);
    const isPlaylistCat =
      form.category === "tournament" || form.category === "playlists";
    let embedId: string;
    if (isPlaylistCat) {
      const playlistId = parsePlaylistIdFromUrl(form.embed_id);
      if (!playlistId) {
        setUrlError("Please enter a valid YouTube playlist URL.");
        return;
      }
      const videoId = parseVideoId(form.embed_id);
      embedId =
        videoId && form.embed_id.includes("list=")
          ? form.embed_id.trim()
          : playlistId;
    } else {
      embedId = parseYouTubeId(form.embed_id, "video");
      if (!embedId) {
        setUrlError("Please enter a valid YouTube video URL.");
        return;
      }
    }
    try {
      const payload = {
        ...form,
        embed_id: embedId,
        thumbnail: form.thumbnail || undefined,
      };
      if (editing) {
        const res = await apiFetch(`/api/dashboard/gallery/videos/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const updated = await res.json();
        onSuccess(updated);
      } else {
        const res = await apiFetch("/api/dashboard/gallery/videos", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        const created = await res.json();
        onSuccess(created);
      }
      onClose();
    } catch {
      // keep modal open
    }
  };

  return (
    <FormModal
      title={editing ? "Edit Video" : "Add Video"}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="2xl"
    >
      <TextInput
        label="Title"
        name="title"
        value={form.title}
        onChange={(e) => onFormChange((f) => ({ ...f, title: e.target.value }))}
        required
      />
      <div className="space-y-1">
        <TextInput
          label="YouTube URL"
          name="youtube_url"
          value={form.embed_id}
          onChange={(e) => {
            setUrlError(null);
            onFormChange((f) => ({ ...f, embed_id: e.target.value }));
          }}
          placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
          required
          error={urlError ?? undefined}
        />
        <p className="text-xs font-calibri text-gray-500">
          {form.category === "Wednesday" || form.category === "Friday"
            ? "Use a single video link (youtube.com/watch?v=...). Each entry opens one video."
            : form.category === "tournament" || form.category === "playlists"
              ? "Use a playlist link or a video link from within a playlist (with list=). Thumbnail is derived from the video."
              : "Use a single video link for Wednesday/Friday, or a playlist link for Tournament/Playlists."}
        </p>
      </div>
      <TextInput
        label="Thumbnail URL (optional)"
        name="thumbnail"
        value={form.thumbnail}
        onChange={(e) =>
          onFormChange((f) => ({ ...f, thumbnail: e.target.value }))
        }
      />
      <Select
        label="Category"
        name="category"
        value={form.category}
        onChange={(e) =>
          onFormChange((f) => ({ ...f, category: e.target.value }))
        }
        options={VIDEO_CATEGORY_OPTIONS}
      />
      <NumberInput
        label="Display order"
        name="display_order"
        value={form.display_order}
        onChange={(e) =>
          onFormChange((f) => ({
            ...f,
            display_order: Number(e.target.value) || 0,
          }))
        }
      />
      <FormActions onCancel={onClose} />
    </FormModal>
  );
};
