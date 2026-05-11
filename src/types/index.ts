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

