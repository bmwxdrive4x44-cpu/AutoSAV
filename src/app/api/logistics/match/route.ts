import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { applyMatchDisplayThreshold, matchLogisticsRequest } from "@/lib/logistics-matching";
import { UserRole } from "@/types";

const locationSchema = z.object({
  city: z.string().trim().optional(),
  region: z.string().trim().optional(),
  country: z.string().trim().optional(),
  lat: z.number().finite().optional(),
  lng: z.number().finite().optional(),
});

const logisticsRequestSchema = z.object({
  id: z.string().min(1),
  from: locationSchema,
  to: locationSchema,
  weightKg: z.number().positive(),
  volumeM3: z.number().positive(),
  budget: z.number().positive(),
  desiredDate: z.coerce.date(),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dateToleranceDays: z.number().int().min(0).max(14).optional(),
});

const carrierOfferSchema = z.object({
  carrierId: z.string().min(1),
  routeFrom: locationSchema,
  routeTo: locationSchema,
  departureDate: z.coerce.date(),
  arrivalDate: z.coerce.date(),
  capacityKg: z.number().positive(),
  capacityM3: z.number().positive(),
  price: z.number().positive(),
  restrictions: z.array(z.string()).optional(),
  reliabilityScore: z.number().min(0).max(100).optional(),
});

const payloadSchema = z.object({
  request: logisticsRequestSchema,
  offers: z.array(carrierOfferSchema),
  minScore: z.number().min(0).max(100).optional(),
});

export async function POST(req: NextRequest) {
  await requireRole([UserRole.USER]);

  try {
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload invalide",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const rawResult = matchLogisticsRequest(parsed.data.request, parsed.data.offers);
    const result =
      typeof parsed.data.minScore === "number"
        ? applyMatchDisplayThreshold(rawResult, parsed.data.minScore)
        : rawResult;

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur lors du matching logistique" }, { status: 500 });
  }
}