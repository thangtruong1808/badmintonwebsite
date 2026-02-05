import type { Column } from "../../Shared/DataTable";

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

export interface PhotoFormData {
  src: string;
  alt: string;
  type: string;
  display_order: number;
}

export interface VideoFormData {
  title: string;
  embed_id: string;
  thumbnail: string;
  category: string;
  display_order: number;
}

export const PHOTO_TYPE_OPTIONS = [
  { value: "chibi-tournament", label: "Chibi Tournament" },
  { value: "veteran-tournament", label: "Veteran Tournament" },
];

export const VIDEO_CATEGORY_OPTIONS = [
  { value: "Wednesday", label: "Wednesday" },
  { value: "Friday", label: "Friday" },
  { value: "tournament", label: "Tournament" },
  { value: "playlists", label: "Playlists" },
];

export const PHOTO_COLUMNS: Column<GalleryPhotoRow>[] = [
  { key: "id", label: "ID" },
  { key: "src", label: "Src", render: (r) => r.src.slice(0, 30) + "…" },
  { key: "alt", label: "Alt" },
  { key: "type", label: "Type" },
  { key: "display_order", label: "Order" },
];

export const VIDEO_COLUMNS: Column<GalleryVideoRow>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "embed_id", label: "Embed ID" },
  { key: "category", label: "Category" },
  { key: "display_order", label: "Order" },
];
