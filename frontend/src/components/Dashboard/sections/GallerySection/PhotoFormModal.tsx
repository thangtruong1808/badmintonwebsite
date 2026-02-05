import React, { useRef } from "react";
import { FaImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import FormModal from "../../Shared/FormModal";
import { TextInput, NumberInput, Select, FormActions } from "../../Shared/inputs";
import { API_BASE } from "../../../../utils/api";
import { apiFetch } from "../../../../utils/api";
import type { GalleryPhotoRow, PhotoFormData } from "./types";
import { PHOTO_TYPE_OPTIONS } from "./types";

interface PhotoFormModalProps {
  open: boolean;
  editing: GalleryPhotoRow | null;
  form: PhotoFormData;
  onFormChange: (updater: (prev: PhotoFormData) => PhotoFormData) => void;
  onClose: () => void;
  onSuccess: (photo: GalleryPhotoRow) => void;
  uploading: boolean;
  uploadError: string | null;
  onUploadingChange: (v: boolean) => void;
  onUploadErrorChange: (v: string | null) => void;
}

export const PhotoFormModal: React.FC<PhotoFormModalProps> = ({
  open,
  editing,
  form,
  onFormChange,
  onClose,
  onSuccess,
  uploading,
  uploadError,
  onUploadingChange,
  onUploadErrorChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadGalleryPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onUploadErrorChange("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onUploadErrorChange("Image size must be less than 5MB.");
      return;
    }
    onUploadErrorChange(null);
    onUploadingChange(true);
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
      onFormChange((f) => ({ ...f, src: data.url }));
    } catch (err) {
      onUploadErrorChange(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      onUploadingChange(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadGalleryPhoto(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.src?.trim()) {
      onUploadErrorChange("Please upload a photo.");
      return;
    }
    onUploadErrorChange(null);
    try {
      if (editing) {
        const res = await apiFetch(`/api/dashboard/gallery/photos/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        if (!res.ok) return;
        const updated = await res.json();
        onSuccess(updated);
      } else {
        const res = await apiFetch("/api/dashboard/gallery/photos", {
          method: "POST",
          body: JSON.stringify(form),
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
      title={editing ? "Edit Photo" : "Add Photo"}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="2xl"
    >
      <div className="space-y-2">
        <label className="block font-calibri text-sm font-medium text-gray-700">
          Photo
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload gallery photo"
        />
        {form.src ? (
          <div className="relative rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
            <img
              src={form.src}
              alt={form.alt || "Preview"}
              className="w-full h-40 sm:h-48 object-contain"
            />
            <button
              type="button"
              onClick={() => onFormChange((f) => ({ ...f, src: "" }))}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              aria-label="Remove photo"
            >
              <FaTimes size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (uploading) return;
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith("image/")) uploadGalleryPhoto(file);
            }}
            className="w-full min-h-[120px] sm:min-h-[140px] rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
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
        {uploadError && (
          <p className="text-sm text-red-600 font-calibri">{uploadError}</p>
        )}
      </div>
      <TextInput
        label="Alt"
        name="alt"
        value={form.alt}
        onChange={(e) => onFormChange((f) => ({ ...f, alt: e.target.value }))}
        required
      />
      <Select
        label="Type"
        name="type"
        value={form.type}
        onChange={(e) => onFormChange((f) => ({ ...f, type: e.target.value }))}
        options={PHOTO_TYPE_OPTIONS}
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
