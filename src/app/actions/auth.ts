"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createToken, normalizeUserRole } from "@/lib/auth";
import { UserRole } from "@/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  redirect: z.string().nullable().optional(),
  lang: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().nullable().optional(),
  redirect: z.string().nullable().optional(),
  lang: z.string().nullable().optional(),
  action: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: formData.get("redirect"),
    lang: formData.get("lang"),
    action: formData.get("action"),
    role: formData.get("role"),
  });

  const toLoginErrorUrl = (errorCode: string) => {
    const params = new URLSearchParams();
    params.set("error", errorCode);

    if (parsed.success) {
      if (parsed.data.redirect) params.set("redirect", parsed.data.redirect);
      if (parsed.data.lang) params.set("lang", parsed.data.lang);
      if (parsed.data.action) params.set("action", parsed.data.action);
      if (parsed.data.role) params.set("role", parsed.data.role);
    } else {
      const redirectValue = formData.get("redirect");
      const langValue = formData.get("lang");
      const actionValue = formData.get("action");
      const roleValue = formData.get("role");

      if (typeof redirectValue === "string" && redirectValue) params.set("redirect", redirectValue);
      if (typeof langValue === "string" && langValue) params.set("lang", langValue);
      if (typeof actionValue === "string" && actionValue) params.set("action", actionValue);
      if (typeof roleValue === "string" && roleValue) params.set("role", roleValue);
    }

    return `/login?${params.toString()}`;
  };

  if (!parsed.success) {
    redirect(toLoginErrorUrl("invalid_form"));
  }

  const data = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) redirect(toLoginErrorUrl("invalid_credentials"));

  const valid = await verifyPassword(data.password, user.password);
  if (!valid) redirect(toLoginErrorUrl("invalid_credentials"));

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Si un URL de redirection personnalisé est fourni, l'utiliser
  if (data.redirect) {
    redirect(data.redirect);
  }

  const role = normalizeUserRole(user.role);
  if (role === UserRole.ADMIN) {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone"),
    redirect: formData.get("redirect"),
    lang: formData.get("lang"),
    action: formData.get("action"),
    role: formData.get("role"),
  });

  const toRegisterErrorUrl = (errorCode: string) => {
    const params = new URLSearchParams();
    params.set("error", errorCode);

    if (parsed.success) {
      if (parsed.data.redirect) params.set("redirect", parsed.data.redirect);
      if (parsed.data.lang) params.set("lang", parsed.data.lang);
      if (parsed.data.action) params.set("action", parsed.data.action);
      if (parsed.data.role) params.set("role", parsed.data.role);
    } else {
      const redirectValue = formData.get("redirect");
      const langValue = formData.get("lang");
      const actionValue = formData.get("action");
      const roleValue = formData.get("role");

      if (typeof redirectValue === "string" && redirectValue) params.set("redirect", redirectValue);
      if (typeof langValue === "string" && langValue) params.set("lang", langValue);
      if (typeof actionValue === "string" && actionValue) params.set("action", actionValue);
      if (typeof roleValue === "string" && roleValue) params.set("role", roleValue);
    }

    return `/register?${params.toString()}`;
  };

  if (!parsed.success) {
    redirect(toRegisterErrorUrl("invalid_form"));
  }

  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) redirect(toRegisterErrorUrl("email_exists"));

  const hashed = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      phone: data.phone || null,
      role: UserRole.USER,
      agentValidationStatus: "NOT_APPLICABLE",
    },
  });

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Si un URL de redirection personnalisé est fourni, l'utiliser
  if (data.redirect) {
    redirect(data.redirect);
  }

  if (normalizeUserRole(user.role) === UserRole.ADMIN) {
    redirect("/admin/dashboard");
  }
  redirect("/dashboard");
}

export async function logout() {
  cookies().delete("session");
  redirect("/");
}

