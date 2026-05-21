import {
  CarrierOfferInput,
  LogisticsMatchOutput,
  LogisticsRequestInput,
  MatchLocation,
  MatchResultItem,
  MatchStatus,
} from "@/types";

const WEIGHTS = {
  geographic: 40,
  date: 25,
  capacity: 20,
  price: 15,
} as const;

const DEFAULT_TOLERANCE_DAYS = 2;

const LOCATION_ALIASES: Record<string, string> = {
  dz: "algeria",
  algerie: "algeria",
  alger: "algeria",
  algeria: "algeria",
  الجزائر: "algeria",
  fr: "france",
  france: "france",
  uk: "unitedkingdom",
  gb: "unitedkingdom",
  unitedkingdom: "unitedkingdom",
  us: "usa",
  usa: "usa",
  unitedstates: "usa",
};

function getUrgencyFactor(urgency: LogisticsRequestInput["urgency"]): number {
  switch (urgency) {
    case "CRITICAL":
      return 0.35;
    case "HIGH":
      return 0.6;
    case "MEDIUM":
      return 0.85;
    case "LOW":
    default:
      return 1;
  }
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value?: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function splitTokens(value?: string): string[] {
  return normalizeText(value)
    .split(/[^A-Za-z0-9\u00C0-\u024F\u0600-\u06FF]+/)
    .map((token) => token.trim())
    .map((token) => LOCATION_ALIASES[token] || token)
    .filter(Boolean);
}

function tokenSimilarity(a?: string, b?: string): number {
  const aTokens = new Set(splitTokens(a));
  const bTokens = new Set(splitTokens(b));

  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  const intersection = Array.from(aTokens).filter((token) => bTokens.has(token)).length;

  const union = aTokens.size + bTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function fieldSimilarity(a?: string, b?: string): number {
  const aNorm = normalizeText(a);
  const bNorm = normalizeText(b);

  if (!aNorm || !bNorm) {
    return 0;
  }

  if (aNorm === bNorm) {
    return 1;
  }

  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) {
    return 0.85;
  }

  if (aNorm.startsWith(bNorm) || bNorm.startsWith(aNorm)) {
    return 0.75;
  }

  return tokenSimilarity(a, b);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function hasCoordinates(location: MatchLocation): boolean {
  return Number.isFinite(location.lat) && Number.isFinite(location.lng);
}

function haversineKm(a: MatchLocation, b: MatchLocation): number | null {
  if (!hasCoordinates(a) || !hasCoordinates(b)) {
    return null;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians((b.lat as number) - (a.lat as number));
  const dLng = toRadians((b.lng as number) - (a.lng as number));

  const lat1 = toRadians(a.lat as number);
  const lat2 = toRadians(b.lat as number);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

function distanceScore(distanceKm: number): number {
  if (distanceKm <= 15) return 1;
  if (distanceKm <= 50) return 0.9;
  if (distanceKm <= 100) return 0.8;
  if (distanceKm <= 250) return 0.55;
  if (distanceKm <= 400) return 0.35;
  return 0.1;
}

function computeLocationScore(requestLoc: MatchLocation, carrierLoc: MatchLocation): { score: number; detail: string } {
  const distance = haversineKm(requestLoc, carrierLoc);

  if (distance !== null) {
    return {
      score: distanceScore(distance),
      detail: `${Math.round(distance)} km`,
    };
  }

  const country = Math.max(
    tokenSimilarity(requestLoc.country, carrierLoc.country),
    fieldSimilarity(requestLoc.country, carrierLoc.country)
  );
  const region = Math.max(
    tokenSimilarity(requestLoc.region, carrierLoc.region),
    fieldSimilarity(requestLoc.region, carrierLoc.region)
  );
  const city = Math.max(
    tokenSimilarity(requestLoc.city, carrierLoc.city),
    fieldSimilarity(requestLoc.city, carrierLoc.city)
  );
  const score = clamp(country * 0.35 + region * 0.25 + city * 0.4);

  const reqLabel = [requestLoc.city, requestLoc.region, requestLoc.country].filter(Boolean).join(", ");
  const carLabel = [carrierLoc.city, carrierLoc.region, carrierLoc.country].filter(Boolean).join(", ");

  return {
    score,
    detail: `${reqLabel || "-"} <> ${carLabel || "-"}`,
  };
}

function parseDate(value: Date | string): Date {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value provided to matching engine");
  }
  return parsed;
}

function dateDiffDays(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(a.getTime() - b.getTime()) / msPerDay;
}

function getStatus(score: number): MatchStatus {
  if (score >= 80) return "RECOMMANDE";
  if (score >= 60) return "ACCEPTABLE";
  return "FAIBLE_MATCH";
}

function buildExplanation(
  geographicPoints: number,
  datePoints: number,
  capacityPoints: number,
  pricePoints: number,
  geoDetail: string,
  dayGap: number,
  toleranceDays: number,
  requestedWeightKg: number,
  requestedVolumeM3: number,
  availableWeightKg: number,
  availableVolumeM3: number,
  budget: number,
  price: number,
  reliabilityScore?: number
): string {
  const parts = [
    `Geo ${geographicPoints.toFixed(1)}/40 (${geoDetail})`,
    `Date ${datePoints.toFixed(1)}/25 (ecart ${dayGap.toFixed(1)}j, tol ${toleranceDays}j)`,
    `Capacite ${capacityPoints.toFixed(1)}/20 (poids ${requestedWeightKg}/${availableWeightKg}kg, volume ${requestedVolumeM3}/${availableVolumeM3}m3)`,
    `Prix ${pricePoints.toFixed(1)}/15 (budget ${budget}, prix ${price})`,
  ];

  if (typeof reliabilityScore === "number") {
    parts.push(`Fiabilite transporteur ${Math.round(clamp(reliabilityScore / 100) * 100)}/100 (utilisee en departage)`);
  }

  return parts.join(" | ");
}

export function matchLogisticsRequest(
  request: LogisticsRequestInput,
  carrierOffers: CarrierOfferInput[]
): LogisticsMatchOutput {
  const baseToleranceDays = request.dateToleranceDays ?? DEFAULT_TOLERANCE_DAYS;
  const urgencyFactor = getUrgencyFactor(request.urgency);
  const toleranceDays = Math.max(0.5, Number((baseToleranceDays * urgencyFactor).toFixed(2)));
  const desiredDate = parseDate(request.desiredDate);

  const matches: MatchResultItem[] = [];

  for (const offer of carrierOffers) {
    const departureDate = parseDate(offer.departureDate);
    const arrivalDate = parseDate(offer.arrivalDate);

    if (arrivalDate.getTime() < departureDate.getTime()) {
      continue;
    }

    const hasCapacity = request.weightKg <= offer.capacityKg && request.volumeM3 <= offer.capacityM3;
    if (!hasCapacity) {
      continue;
    }

    if (offer.price > request.budget) {
      continue;
    }

    const dayGap = dateDiffDays(arrivalDate, desiredDate);
    if (dayGap > toleranceDays) {
      continue;
    }

    const fromLocation = computeLocationScore(request.from, offer.routeFrom);
    const toLocation = computeLocationScore(request.to, offer.routeTo);
    const geographicRatio = clamp(fromLocation.score * 0.45 + toLocation.score * 0.55);

    const dateRatio = clamp(1 - dayGap / (toleranceDays + 1));

    const weightRatio = request.weightKg / Math.max(offer.capacityKg, 0.0001);
    const volumeRatio = request.volumeM3 / Math.max(offer.capacityM3, 0.0001);
    const avgRatio = clamp((weightRatio + volumeRatio) / 2);
    const capacityRatio = clamp(0.7 + 0.3 * avgRatio);

    const budgetRatio = clamp(offer.price / Math.max(request.budget, 1));
    const priceRatio = clamp(0.6 + 0.4 * (1 - budgetRatio));

    const geographicPoints = geographicRatio * WEIGHTS.geographic;
    const datePoints = dateRatio * WEIGHTS.date;
    const capacityPoints = capacityRatio * WEIGHTS.capacity;
    const pricePoints = priceRatio * WEIGHTS.price;

    const totalScore = Number((geographicPoints + datePoints + capacityPoints + pricePoints).toFixed(2));
    const status = getStatus(totalScore);

    matches.push({
      carrierId: offer.carrierId,
      totalScore,
      status,
      explanation: buildExplanation(
        geographicPoints,
        datePoints,
        capacityPoints,
        pricePoints,
        `depart ${fromLocation.detail}; arrivee ${toLocation.detail}`,
        dayGap,
        toleranceDays,
        request.weightKg,
        request.volumeM3,
        offer.capacityKg,
        offer.capacityM3,
        request.budget,
        offer.price,
        offer.reliabilityScore
      ) + ` | Urgence ${request.urgency} (tol ajustee ${toleranceDays}j)`,
      scoreBreakdown: {
        geographic: Number(geographicPoints.toFixed(2)),
        date: Number(datePoints.toFixed(2)),
        capacity: Number(capacityPoints.toFixed(2)),
        price: Number(pricePoints.toFixed(2)),
      },
    });
  }

  matches.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    const aReliability = carrierOffers.find((offer) => offer.carrierId === a.carrierId)?.reliabilityScore ?? 0;
    const bReliability = carrierOffers.find((offer) => offer.carrierId === b.carrierId)?.reliabilityScore ?? 0;
    return bReliability - aReliability;
  });

  if (matches.length === 0) {
    return {
      requestId: request.id,
      matches: [],
      message: "aucun match disponible",
    };
  }

  return {
    requestId: request.id,
    matches,
  };
}

export function applyMatchDisplayThreshold(
  output: LogisticsMatchOutput,
  minScore: number
): LogisticsMatchOutput {
  if (output.matches.length === 0) {
    return output;
  }

  const sanitizedMinScore = Math.max(0, Math.min(100, minScore));
  const filtered = output.matches.filter((match) => match.totalScore >= sanitizedMinScore);

  if (filtered.length > 0) {
    return {
      ...output,
      matches: filtered,
    };
  }

  return {
    ...output,
    matches: [output.matches[0]],
    message: `Aucun match au-dessus du seuil ${sanitizedMinScore}, meilleur candidat conservé`,
  };
}