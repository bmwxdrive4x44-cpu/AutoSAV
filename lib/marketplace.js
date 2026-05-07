const PARTS = [
  {
    id: "p1",
    name: "Renault Clio Front Bumper",
    price: "18,500 DZD",
    condition: "Used - Good",
    location: "Algiers",
    seller: "Mourad Auto",
  },
  {
    id: "p2",
    name: "VW Golf 6 Alternator",
    price: "22,000 DZD",
    condition: "Used - Tested",
    location: "Oran",
    seller: "West Parts DZ",
  },
  {
    id: "p3",
    name: "Peugeot 208 Headlight Left",
    price: "14,000 DZD",
    condition: "New",
    location: "Constantine",
    seller: "Pièces Express",
  },
];

const REQUESTS_KEY = "autosav.partRequests";
const OFFERS_KEY = "autosav.offers";

function normalizeText(text) {
  return String(text || "").trim().toLowerCase();
}

export function filterParts(query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return PARTS;
  }
  return PARTS.filter((part) => normalizeText(part.name).includes(normalizedQuery));
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getStorageList(key) {
  if (!canUseStorage()) {
    return [];
  }
  const value = window.localStorage.getItem(key);
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStorageList(key, items) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function createPartRequest(payload) {
  const requests = getStorageList(REQUESTS_KEY);
  const request = {
    id: `r-${Date.now()}`,
    partName: payload.partName,
    location: payload.location,
    details: payload.details || "",
  };
  requests.unshift(request);
  setStorageList(REQUESTS_KEY, requests);
  return request;
}

export function getPartRequests() {
  return getStorageList(REQUESTS_KEY);
}

export function submitOffer(payload) {
  const offers = getStorageList(OFFERS_KEY);
  const offer = {
    id: `o-${Date.now()}`,
    requestId: payload.requestId,
    amount: payload.amount,
    seller: payload.seller,
  };
  offers.unshift(offer);
  setStorageList(OFFERS_KEY, offers);
  return offer;
}

export function getOffersForRequest(requestId) {
  return getStorageList(OFFERS_KEY).filter((offer) => offer.requestId === requestId);
}
