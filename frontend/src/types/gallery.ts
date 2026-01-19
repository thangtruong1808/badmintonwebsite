export interface Photo {
  id: number;
  src: string;
  alt: string;
  type: "social" | "chibi-tournament" | "veteran-tournament"; // Added type for filtering
}

export interface Video {
  id: number;
  title: string;
  embedId: string;
  thumbnail: string;
  category: "Wednesday" | "Friday" | "tournament" | "playlists"; // Added category for filtering
}
