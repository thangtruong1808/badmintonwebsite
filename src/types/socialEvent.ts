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
}

export interface Registration {
  eventId: number;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: "pending" | "confirmed" | "cancelled";
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
