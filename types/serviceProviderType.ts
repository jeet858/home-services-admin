export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    country: string;
  };
  services: string[];
  subservices: string[];
  specializations: string[];
  experience: number;
  experienceUnit: string; // e.g. "years"
  status: "verification_pending" | "verified" | "rejected" | string; // can extend with more statuses
  rating: {
    ratingDistribution: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
    average: number;
    totalRatings: number;
  };
  availability: {
    monday: { available: boolean };
    tuesday: { available: boolean };
    wednesday: { available: boolean };
    thursday: { available: boolean };
    friday: { available: boolean };
    saturday: { available: boolean };
    sunday: { available: boolean };
  };
  aadhaarCard: {
    number: string;
    verified: boolean;
  };
  panCard: {
    number: string;
    verified: boolean;
  };
  passportPhoto: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string; // ISO Date string
}
export interface Booking {
  _id?: string;
  userId?: string;
  services?: any[];
  subservices?: {
    _id?: string;
    name?: string;
    description?: string;
  }[];
  addressId?: {
    _id?: string;
    userId?: string;
    houseNo?: string;
    street?: string;
    fullAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    createdAt?: string;
    __v?: number;
  };
  date?: string;
  time?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled" | string;
  discount?: number;
  finalPrice?: number;
  createdAt?: string;
  __v?: number;
  assignedAt?: string;
  assignedBy?: {
    _id?: string;
    name?: string;
  };
  serviceProviderId?: {
    _id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    rating?: {
      ratingDistribution?: {
        "1"?: number;
        "2"?: number;
        "3"?: number;
        "4"?: number;
        "5"?: number;
      };
      average?: number;
      totalRatings?: number;
    };
  };
  rating?: {
    score?: number;
    comment?: string;
  } | null;
}
