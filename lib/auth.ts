import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
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
  return process.env.SESSION_SECRET || "dev-secret";
}

function encodeSession(data: CreateSessionInput) {
  const payload = JSON.stringify({
    id: data.userId,
    employeeId: data.employeeId ?? null,
    email: data.email,
    role: data.role,
    fullName: data.fullName ?? null,
  });

  const encoded = Buffer.from(payload).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

function decodeSession(token: string): SessionUser | null {
  const [encoded, signature] = token.split(".");

  if (!encoded || !signature) return null;

  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encoded)
    .digest("base64url");

  if (signature !== expected) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString()
    );

    return parsed;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(
  plain: string,
  hashed: string
) {
  return compare(plain, hashed);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { employee: true },
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
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return decodeSession(token);
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireSessionUser();
  if (user.role !== "ADMIN") redirect("/unauthorized");
  return user;
}

export async function requireStaff() {
  const user = await requireSessionUser();
  if (user.role !== "STAFF") redirect("/unauthorized");
  return user;
}