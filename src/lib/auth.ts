import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { prisma } from "./prisma";
import { UserRole } from "@/types";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export async function createToken(payload: { userId: string; email: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, { clockTolerance: 60 });
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function normalizeUserRole(role: string): UserRole {
  if (role === UserRole.ADMIN) return UserRole.ADMIN;
  // Backward compatibility during migration from CLIENT/AGENT_BUYER to USER.
  return UserRole.USER;
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      agentValidationStatus: true,
      isBlocked: true,
    },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.isBlocked) throw new Error("Votre compte a Ã©tÃ© bloquÃ©. Contactez le support.");
  return user;
}


// Nouvelle version universelle
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  const normalizedRole = normalizeUserRole(user.role);

  if (normalizedRole === UserRole.ADMIN) return user;
  if (!allowedRoles.includes(normalizedRole)) throw new Error("Forbidden");

  return user;
}

