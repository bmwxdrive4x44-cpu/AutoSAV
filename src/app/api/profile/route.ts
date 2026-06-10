import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateProfileApiSchema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = updateProfileApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const { name, phone } = parsed.data;

    await prisma.user.updateMany({
      where: { id: user.id },
      data: { name, phone: phone || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
      }

      if (error.message.includes("bloqué")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
