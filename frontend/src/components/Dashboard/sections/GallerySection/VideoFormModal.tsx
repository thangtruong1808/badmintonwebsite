import React, { useEffect } from "react";
import FormModal from "../../Shared/FormModal";
import { TextInput, NumberInput, Select, FormActions } from "../../Shared/inputs";
import { apiFetch } from "../../../../utils/api";
import type { GalleryVideoRow, VideoFormData } from "./types";
import { VIDEO_CATEGORY_OPTIONS } from "./types";

/** Extract YouTube video ID or playlist ID from URL, or return as-is if already an ID. */
function parseYouTubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  // Already a short ID (video ~11 chars, playlist PLxxx...)
  if (/^[\w-]{10,40}$/.test(trimmed)) return trimmed;
  // youtube.com/playlist?list=ID
  const list = trimmed.match(/[?&]list=([\w-]+)/);
  if (list) return list[1];
  // youtube.com/watch?v=ID
  const watch = trimmed.match(/[?&]v=([\w-]{10,12})/);
  if (watch) return watch[1];
  // youtu.be/ID
  const short = trimmed.match(/youtu\.be\/([\w-]{10,12})/);
  if (short) return short[1];
  // youtube.com/embed/ID
  const embed = trimmed.match(/youtube\.com\/embed\/([\w-]{10,12})/);
  if (embed) return embed[1];
  // youtube.com/v/ID
  const v = trimmed.match(/youtube\.com\/v\/([\w-]{10,12})/);
  if (v) return v[1];
  return trimmed;
}

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
    const embedId = parseYouTubeId(form.embed_id);
    if (!embedId) {
      setUrlError("Please enter a valid YouTube video or playlist URL.");
      return;
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
          Paste a YouTube video or playlist link. No upload needed.
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
