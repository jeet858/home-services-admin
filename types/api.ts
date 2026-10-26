// Shapes returned by subidha_backend (NestJS + Prisma). IDs are UUID strings named `id`.

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentMethod = "online" | "cash";
export type PaymentStatus = "pending" | "paid";
export type ProviderStatus = "active" | "inactive" | "suspended" | "pending" | "verification_pending";
export type RatingStatus = "pending" | "approved" | "rejected";
export type CouponType = "percent" | "flat" | "cashback";
export type ExperienceUnit = "months" | "years";
export type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: "client" | "admin";
  lastLogin: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  houseNo: string | null;
  street: string;
  fullAddress: string | null;
  landmark: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
}

export interface Subservice {
  id: string;
  serviceId: string;
  name: string;
  description: string | null;
  process: string | null;
  originalPrice: number;
  discountedPrice: number;
  duration: string;
  image: string | null;
  createdAt: string;
  service?: { id: string; name: string; description: string | null };
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  process: string | null;
  originalPrice: number;
  discountedPrice: number;
  duration: string;
  image: string | null;
  createdAt: string;
  subservices?: Subservice[];
}

export interface Summary {
  id: string;
  name: string;
  description: string | null;
}

export interface Booking {
  id: string;
  userId: string;
  addressId: string | null;
  serviceProviderId: string | null;
  date: string;
  time: string;
  status: BookingStatus;
  discount: number;
  finalPrice: number;
  assignedAt: string | null;
  assignedById: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  serviceOtp: string | null;
  notes: string | null;
  tip: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  user?: { id: string; name: string | null; phoneNumber: string; email: string | null } | null;
  services: Summary[];
  subservices: Summary[];
  address: Address | null;
  serviceProvider: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    ratingAverage: number;
    ratingTotal: number;
  } | null;
  assignedBy: { id: string; name: string | null } | null;
}

export interface ProviderRating {
  average: number;
  totalRatings: number;
  ratingDistribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface DayAvailability {
  available?: boolean;
  start?: string;
  end?: string;
}

export interface KycCard {
  number?: string | null;
  image?: string | null;
  verified?: boolean;
}

export interface Certification {
  id?: string;
  name: string;
  issuingAuthority: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  certificateNumber?: string | null;
}

export interface ProviderDocument {
  id?: string;
  type: string;
  name: string;
  url: string;
  uploadedAt?: string;
  verified?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string | null;
  services: Summary[];
  subservices: Summary[];
  specializations: string[];
  experience: number;
  experienceUnit: ExperienceUnit;
  qualification: string | null;
  status: ProviderStatus;
  rating: ProviderRating;
  availability: Partial<Record<Weekday, DayAvailability>>;
  aadhaarCard: KycCard;
  panCard: KycCard;
  passportPhoto: string | null;
  createdBy: { id: string; name: string | null } | null;
  verifiedBy: { id: string; name: string | null } | null;
  verifiedAt: string | null;
  createdAt: string;
  // detail-only
  certifications?: Certification[];
  documents?: ProviderDocument[];
  bankDetails?: {
    accountNumber?: string | null;
    ifscCode?: string | null;
    accountHolderName?: string | null;
    bankName?: string | null;
  };
  commission?: number;
  notes?: string | null;
  updatedAt?: string;
}

export interface ProviderStats {
  provider: Pick<ServiceProvider, "id" | "name" | "email" | "phoneNumber" | "status" | "rating">;
  bookings: { total: number; byStatus: Partial<Record<BookingStatus, number>> };
  earnings: { totalEarnings: number; totalBookings: number };
}

export interface Rating {
  id: string;
  rating: number;
  feedback: string;
  status: RatingStatus;
  subservice: Summary | null;
  service: { id: string; name: string } | null;
  user: { id: string; name: string | null; phoneNumber: string } | null;
  booking: { id: string; date: string; time: string } | null;
  reviewedBy?: { id: string; name: string | null } | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  tag: string | null;
  type: CouponType;
  value: number;
  maxDiscount: number | null;
  minOrder: number;
  validTill: string | null;
  perUserLimit: number | null;
  active: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totals: {
    bookings: Partial<Record<BookingStatus, number>>;
    today: number;
    upcoming: number;
    unassignedUpcoming: number;
    customers: number;
    providers: Partial<Record<ProviderStatus, number>>;
    pendingRatings: number;
    revenue: number;
    tips: number;
  };
  series: { date: string; bookings: number; revenue: number }[];
  topServices: { id: string; name: string; bookings: number }[];
}
