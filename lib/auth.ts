import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

export const SESSION_COOKIE_NAME = "avg_printing_session";

type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "STAFF";
  fullName?: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createSession(sessionUser: SessionUser) {
  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    JSON.stringify(sessionUser),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login");
  }

  return sessionUser;
}

export async function requireAdmin() {
  const sessionUser = await requireAuth();

  if (sessionUser.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return sessionUser;
}

export async function requireStaff() {
  const sessionUser = await requireAuth();

  if (sessionUser.role !== "STAFF") {
    redirect("/unauthorized");
  }

  return sessionUser;
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      employee: true,
    },
  });
}