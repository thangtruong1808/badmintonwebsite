export interface SocialEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  dayOfWeek: string;
  location: string;
  description: string;
  maxCapacity: number;
  currentAttendees: number;
  price?: number;
  imageUrl?: string;
  status: "available" | "full" | "completed" | "cancelled";
  category: "regular" | "tournament";
  recurring?: boolean;
  courts?: { id: number; name: string }[];
}

export interface Registration {
  id?: string;
  eventId: number;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "cancelled";
  attendanceStatus?: "attended" | "no-show" | "cancelled" | "upcoming";
  pointsEarned?: number;
  pointsClaimed?: boolean;
  paymentMethod?: "stripe" | "points" | "mixed";
  pointsUsed?: number;
}

/** Registration with event details from API (e.g. profile event list). */
export interface RegistrationWithEventDetails extends Registration {
  eventTitle?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventCategory?: string | null;
  eventPrice?: number | null;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}
