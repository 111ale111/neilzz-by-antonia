import type { BookingInfo, GalleryItem, Review, StudioFeature } from "@/types";

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Camila R.",
    initial: "C",
    rating: 5,
    service: "Chrome Ombré",
    quote:
      "Antonia studied a screenshot I sent and somehow made it look better on my hands than the inspo photo. Three weeks in and the set still looks fresh.",
    date: "May 2026",
    verified: true,
    swatch: "blush",
  },
  {
    id: "r2",
    name: "Priya M.",
    initial: "P",
    rating: 5,
    service: "Gel-X Almond Set",
    quote:
      "Booking through Instagram felt almost too easy. She remembered my shape preference from last time without me saying a word.",
    date: "April 2026",
    verified: true,
    swatch: "sand",
  },
  {
    id: "r3",
    name: "Devon L.",
    initial: "D",
    rating: 5,
    service: "French Tip Revival",
    quote:
      "The cuticle work alone is worth the trip. My hands looked like they belonged to someone with a much calmer life than mine.",
    date: "April 2026",
    verified: true,
    swatch: "rose",
  },
  {
    id: "r4",
    name: "Hana K.",
    initial: "H",
    rating: 5,
    service: "Hand-Painted Florals",
    quote:
      "I brought a vague idea and a paint swatch. She brought patience and a steady hand. Every petal is slightly different, on purpose.",
    date: "March 2026",
    verified: true,
    swatch: "ink",
  },
  {
    id: "r5",
    name: "Greta S.",
    initial: "G",
    rating: 5,
    service: "Soft Nude Overlay",
    quote:
      "Asked for 'quiet luxury, not boring.' She understood exactly what that meant before I finished the sentence.",
    date: "March 2026",
    verified: true,
    swatch: "blush",
  },
  {
    id: "r6",
    name: "Yasmin A.",
    initial: "Y",
    rating: 5,
    service: "Chrome Ombré",
    quote:
      "Six appointments in and the studio still smells like fresh linen, not acetone. Small detail, but it tells you everything.",
    date: "February 2026",
    verified: true,
    swatch: "sand",
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    src: "https://picsum.photos/seed/anto-chrome-01/640/800",
    alt: "Chrome ombré manicure in soft rose tones",
    category: "Chrome Ombré",
    tall: true,
  },
  {
    id: "g2",
    src: "https://picsum.photos/seed/anto-french-02/640/640",
    alt: "Modern French tip set with fine gold line",
    category: "French Tip",
  },
  {
    id: "g3",
    src: "https://picsum.photos/seed/anto-floral-03/640/800",
    alt: "Hand-painted floral accent nail",
    category: "Hand-Painted",
    tall: true,
  },
  {
    id: "g4",
    src: "https://picsum.photos/seed/anto-nude-04/640/640",
    alt: "Soft nude almond-shaped overlay",
    category: "Nude Overlay",
  },
  {
    id: "g5",
    src: "https://picsum.photos/seed/anto-gelx-05/640/800",
    alt: "Gel-X extension in glossy finish",
    category: "Gel-X",
    tall: true,
  },
  {
    id: "g6",
    src: "https://picsum.photos/seed/anto-chrome-06/640/640",
    alt: "Chrome accent on a milky base",
    category: "Chrome Ombré",
  },
  {
    id: "g7",
    src: "https://picsum.photos/seed/anto-art-07/640/800",
    alt: "Fine line nail art detail",
    category: "Hand-Painted",
    tall: true,
  },
  {
    id: "g8",
    src: "https://picsum.photos/seed/anto-french-08/640/640",
    alt: "Classic French tip with rounded edge",
    category: "French Tip",
  },
];

export const bookingInfo: BookingInfo = {
  status: "limited",
  label: "Limited slots — July",
  detail:
    "A handful of appointments remain before the books close for the month. New clients are seen by referral or Instagram DM.",
  nextOpening: "Mon, 6 Jul",
};

export const studioFeatures: StudioFeature[] = [
  {
    id: "s1",
    title: "Galerie uploads",
    description: "New sets are added to the portfolio straight after each appointment.",
    icon: "upload",
  },
  {
    id: "s2",
    title: "Review approval",
    description: "Every review is read and approved by Antonia before it goes live.",
    icon: "check",
  },
  {
    id: "s3",
    title: "One-time codes",
    description: "Verified clients receive a single-use code to unlock the inner circle.",
    icon: "key",
  },
  {
    id: "s4",
    title: "Booking status",
    description: "The status banner is updated by hand as the calendar fills up.",
    icon: "calendar",
  },
];

export const instagramHandle = "@neilzz_by.anto";
export const instagramUrl = "https://instagram.com/neilzz_by.anto";
export const brandName = "Antonia";
