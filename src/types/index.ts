export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
};

export type RequestWithOffers = {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  budget: number;
  countryToBuyFrom: string;
  images: string;
  status: string;
  createdAt: Date;
  requester: { name: string };
  offers: {
    id: string;
    price: number;
    estimatedDeliveryDays: number;
    message: string;
    status: string;
    provider: { name: string };
  }[];
  _count: { offers: number };
};

export type OfferWithRequest = {
  id: string;
  price: number;
  estimatedDeliveryDays: number;
  message: string;
  status: string;
  createdAt: Date;
  request: {
    id: string;
    title: string;
    status: string;
    requester: { name: string };
  };
};

export type MatchUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MatchLocation = {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

export type LogisticsRequestInput = {
  id: string;
  from: MatchLocation;
  to: MatchLocation;
  weightKg: number;
  volumeM3: number;
  budget: number;
  desiredDate: Date | string;
  urgency: MatchUrgency;
  dateToleranceDays?: number;
};

export type CarrierOfferInput = {
  carrierId: string;
  routeFrom: MatchLocation;
  routeTo: MatchLocation;
  departureDate: Date | string;
  arrivalDate: Date | string;
  capacityKg: number;
  capacityM3: number;
  price: number;
  restrictions?: string[];
  reliabilityScore?: number;
};

export type MatchStatus = "RECOMMANDE" | "ACCEPTABLE" | "FAIBLE_MATCH";

export type MatchResultItem = {
  carrierId: string;
  totalScore: number;
  status: MatchStatus;
  explanation: string;
  scoreBreakdown: {
    geographic: number;
    date: number;
    capacity: number;
    price: number;
  };
};

export type LogisticsMatchOutput = {
  requestId: string;
  matches: MatchResultItem[];
  message?: string;
};

