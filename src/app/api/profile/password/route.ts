import { NextRequest, NextResponse } from "next/server";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const data = await req.json();
  const { oldPassword, newPassword } = data;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });
  if (!dbUser) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  const valid = await verifyPassword(oldPassword, dbUser.password);
  if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return NextResponse.json({ success: true });
}
