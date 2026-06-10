"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Champs invalides");
  }

  const data = parsed.data;

  await prisma.user.updateMany({
    where: { id: user.id },
    data: {
      name: data.name,
      phone: data.phone || null,
      country: data.country || null,
      city: data.city || null,
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
