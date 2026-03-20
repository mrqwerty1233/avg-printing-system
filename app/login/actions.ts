"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  getUserByEmail,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function loginAction(formData: FormData): Promise<void> {
  const rawData = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    redirect("/login?error=invalid_input");
  }

  const user = await getUserByEmail(validated.data.email);

  if (!user || !user.isActive) {
    redirect("/login?error=invalid_credentials");
  }

  const isPasswordValid = await verifyPassword(
    validated.data.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    redirect("/login?error=invalid_credentials");
  }

  await createSession({
    userId: user.id,
    employeeId: user.employee?.id ?? null,
    role: user.role,
    email: user.email,
  });

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/staff/dashboard");
}