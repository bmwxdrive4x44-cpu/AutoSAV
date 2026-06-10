import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/offers/accept
// Petit endpoint de verification pour eviter les 404 en test navigateur.
export async function GET() {
  return NextResponse.json({ ok: true, route: "/api/offers/accept", method: "GET" });
}

// POST /api/offers/accept
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const offerId = typeof body?.offerId === "string" ? body.offerId : "";

    if (!offerId) {
      return NextResponse.json({ error: "offerId requis" }, { status: 400 });
    }

    // TODO: Ajouter la logique metier d'acceptation d'offre.
    return NextResponse.json({ success: true, offerId });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur", details: String(error) },
      { status: 500 }
    );
  }
}
