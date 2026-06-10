"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, createToken, normalizeUserRole } from "@/lib/auth";
import { UserRole } from "@/types";

function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  if (
    maybeError.code === "P1000" ||
    maybeError.code === "P1001" ||
    maybeError.code === "P1002" ||
    maybeError.code === "P1017" ||
    maybeError.code === "42P05" ||
    maybeError.code === "08P01"
  ) {
    return true;
  }

  const message = maybeError.message || "";
  return (
    message.includes("Authentication failed against database server") ||
    message.includes("password authentication failed") ||
    message.includes("provided database credentials") ||
    message.includes("Can't reach database server") ||
    message.includes("ECONNREFUSED") ||
    message.includes("Connection terminated") ||
    message.includes("prepared statement") ||
    message.includes("bind message supplies") ||
    message.includes("ENOIDENTIFIER") ||
    message.includes("no tenant identifier provided")
  );
}

async function runDbOpWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 1,
  retryDelayMs = 250
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isDatabaseUnavailableError(error) || attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
    }
  }

  throw lastError;
}

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

  let user:
    | {
        id: string;
        email: string;
        password: string;
        role: string;
      }
    | null = null;
  try {
    user = await runDbOpWithRetry(
      () =>
        prisma.user.findUnique({
          where: { email: data.email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
          },
        }),
      1,
      300
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.error("login database unavailable:", error);
      redirect(toLoginErrorUrl("db_unavailable"));
    }
    throw error;
  }
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

  let existing:
    | {
        id: string;
        email: string;
      }
    | null = null;
  try {
    existing = await runDbOpWithRetry(
      () =>
        prisma.user.findUnique({
          where: { email: data.email },
          select: {
            id: true,
            email: true,
          },
        }),
      1,
      300
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.error("register database unavailable during pre-check:", error);
      redirect(toRegisterErrorUrl("db_unavailable"));
    }
    throw error;
  }
  if (existing) redirect(toRegisterErrorUrl("email_exists"));

  const hashed = await hashPassword(data.password);

  let user: Awaited<ReturnType<typeof prisma.user.create>>;
  try {
    user = await runDbOpWithRetry(
      () =>
        prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashed,
            phone: data.phone || null,
            role: UserRole.USER,
            agentValidationStatus: "NOT_APPLICABLE",
          },
        }),
      1,
      300
    );
  } catch (error) {
    if (isDatabaseUnavailableError(error)) {
      console.error("register database unavailable during create:", error);
      redirect(toRegisterErrorUrl("db_unavailable"));
    }
    throw error;
  }

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

