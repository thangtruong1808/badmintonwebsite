/** Display shape for event on public pages (from API or legacy). */
export interface EventDisplay {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  imageUrl?: string;
  status: string;
  currentAttendees?: number;
  attendees?: number;
}
