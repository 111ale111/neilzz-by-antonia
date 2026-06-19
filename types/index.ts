export interface Review {
  id: string;
  name: string;
  initial: string;
  rating: 1 | 2 | 3 | 4 | 5;
  service: string;
  quote: string;
  date: string;
  verified: boolean;
  swatch: "blush" | "sand" | "rose" | "ink";
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: string;
  tall?: boolean;
}

export type BookingStatus = "open" | "limited" | "waitlist";

export interface BookingInfo {
  status: BookingStatus;
  label: string;
  detail: string;
  nextOpening: string;
}

export interface StudioFeature {
  id: string;
  title: string;
  description: string;
  icon: "upload" | "check" | "key" | "calendar";
}
