import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  employeeId?: string | null;
  email: string;
  role: "ADMIN" | "STAFF";
  fullName?: string | null;
};

export type CreateSessionInput = {
  userId: string;
  employeeId?: string | null;
  role: "ADMIN" | "STAFF";
  email: string;
  fullName?: string | null;
};

const SESSION_COOKIE_NAME = "avg_printing_session";

function getSessionSecret() {
  return process.env.SESSION_SECRET || "avg-printing-dev-secret-change-this";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function encodeSession(data: CreateSessionInput) {
  const payload = JSON.stringify({
    id: data.userId,
    employeeId: data.employeeId ?? null,
    email: data.email,
    role: data.role,
    fullName: data.fullName ?? null,
  });

  const encodedPayload = toBase64Url(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function decodeSession(token: string): SessionUser | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encodedPayload)) as SessionUser;

    if (!parsed?.id || !parsed?.email || !parsed?.role) {
      return null;
    }

    return {
      id: parsed.id,
      employeeId: parsed.employeeId ?? null,
      email: parsed.email,
      role: parsed.role,
      fullName: parsed.fullName ?? null,
    };
  } catch {
    return null;
  }
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
) {
  return compare(plainPassword, passwordHash);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      employee: true,
    },
  });
}

export async function createSession(data: CreateSessionInput) {
  const cookieStore = await cookies();
  const token = encodeSession(data);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const sessionUser = decodeSession(token);

  if (!sessionUser) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      employee: true,
    },
  });

  if (!dbUser || !dbUser.isActive) {
    return null;
  }

  return {
    id: dbUser.id,
    employeeId: dbUser.employee?.id ?? null,
    email: dbUser.email,
    role: dbUser.role,
    fullName: dbUser.employee?.fullName ?? null,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireSessionUser();

  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireStaff() {
  const user = await requireSessionUser();

  if (user.role !== "STAFF") {
    redirect("/unauthorized");
  }

  return user;
}