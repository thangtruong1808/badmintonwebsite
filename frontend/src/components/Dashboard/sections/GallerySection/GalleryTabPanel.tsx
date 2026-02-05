import React from "react";
import { FaPlus } from "react-icons/fa";
import DataTable from "../../Shared/DataTable";
import { PHOTO_COLUMNS, VIDEO_COLUMNS } from "./types";
import type { GalleryPhotoRow, GalleryVideoRow } from "./types";

interface PhotosTabProps {
  loading: boolean;
  photos: GalleryPhotoRow[];
  onAdd: () => void;
  onEdit: (row: GalleryPhotoRow) => void;
  onDelete: (row: GalleryPhotoRow) => void;
}

export const PhotosTabPanel: React.FC<PhotosTabProps> = ({
  loading,
  photos,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
      >
        <FaPlus size={16} />
        Add Photo
      </button>
    </div>
    {loading ? (
      <p className="font-calibri text-gray-600">Loading...</p>
    ) : (
      <DataTable
        columns={PHOTO_COLUMNS}
        data={photos}
        getRowId={(r) => r.id}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No photos yet. Click Add Photo to create one."
        sortable
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
    )}
  </>
);

interface VideosTabProps {
  loading: boolean;
  videos: GalleryVideoRow[];
  onAdd: () => void;
  onEdit: (row: GalleryVideoRow) => void;
  onDelete: (row: GalleryVideoRow) => void;
}

export const VideosTabPanel: React.FC<VideosTabProps> = ({
  loading,
  videos,
  onAdd,
  onEdit,
  onDelete,
}) => (
  <>
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
      >
        <FaPlus size={16} />
        Add Video
      </button>
    </div>
    {loading ? (
      <p className="font-calibri text-gray-600">Loading...</p>
    ) : (
      <DataTable
        columns={VIDEO_COLUMNS}
        data={videos}
        getRowId={(r) => r.id}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No videos yet. Click Add Video to create one."
        sortable
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
    )}
  </>
);
