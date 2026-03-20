"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function normalizeString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createEmployeeAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const rawData = {
    fullName: normalizeString(formData.get("fullName")),
    email: normalizeString(formData.get("email")).toLowerCase(),
    password: normalizeString(formData.get("password")),
    employeeCode: normalizeString(formData.get("employeeCode")),
    position: normalizeString(formData.get("position")),
    dailySalary: formData.get("dailySalary"),
    lateDeduction: formData.get("lateDeduction"),
    isActive: normalizeString(formData.get("isActive")) || "true",
  };

  const validated = employeeSchema.safeParse(rawData);

  if (!validated.success) {
    redirect("/admin/employees/new?error=invalid_input");
  }

  if (!validated.data.password) {
    redirect("/admin/employees/new?error=password_required");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: validated.data.email,
    },
  });

  if (existingUser) {
    redirect("/admin/employees/new?error=email_exists");
  }

  const cleanedEmployeeCode = validated.data.employeeCode?.trim();

  if (cleanedEmployeeCode) {
    const existingEmployeeCode = await prisma.employee.findFirst({
      where: {
        employeeCode: cleanedEmployeeCode,
      },
    });

    if (existingEmployeeCode) {
      redirect("/admin/employees/new?error=employee_code_exists");
    }
  }

  const passwordHash = await hashPassword(validated.data.password);

  await prisma.user.create({
    data: {
      email: validated.data.email,
      passwordHash,
      role: "STAFF",
      isActive: validated.data.isActive === "true",
      employee: {
        create: {
          fullName: validated.data.fullName,
          employeeCode: cleanedEmployeeCode || null,
          position: validated.data.position || null,
          dailySalary: validated.data.dailySalary,
          lateDeduction: validated.data.lateDeduction,
          isActive: validated.data.isActive === "true",
        },
      },
    },
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees?success=created");
}

export async function updateEmployeeAction(
  employeeId: string,
  formData: FormData
): Promise<void> {
  await requireAdmin();

  const rawData = {
    fullName: normalizeString(formData.get("fullName")),
    email: normalizeString(formData.get("email")).toLowerCase(),
    password: normalizeString(formData.get("password")),
    employeeCode: normalizeString(formData.get("employeeCode")),
    position: normalizeString(formData.get("position")),
    dailySalary: formData.get("dailySalary"),
    lateDeduction: formData.get("lateDeduction"),
    isActive: normalizeString(formData.get("isActive")) || "true",
  };

  const validated = employeeSchema.safeParse(rawData);

  if (!validated.success) {
    redirect(`/admin/employees/${employeeId}/edit?error=invalid_input`);
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { user: true },
  });

  if (!employee) {
    redirect("/admin/employees?error=not_found");
  }

  const existingUserWithEmail = await prisma.user.findFirst({
    where: {
      email: validated.data.email,
      NOT: {
        id: employee.userId,
      },
    },
  });

  if (existingUserWithEmail) {
    redirect(`/admin/employees/${employeeId}/edit?error=email_exists`);
  }

  const cleanedEmployeeCode = validated.data.employeeCode?.trim();

  if (cleanedEmployeeCode) {
    const existingEmployeeCode = await prisma.employee.findFirst({
      where: {
        employeeCode: cleanedEmployeeCode,
        NOT: {
          id: employeeId,
        },
      },
    });

    if (existingEmployeeCode) {
      redirect(`/admin/employees/${employeeId}/edit?error=employee_code_exists`);
    }
  }

  await prisma.user.update({
    where: {
      id: employee.userId,
    },
    data: {
      email: validated.data.email,
      isActive: validated.data.isActive === "true",
      ...(validated.data.password
        ? { passwordHash: await hashPassword(validated.data.password) }
        : {}),
    },
  });

  await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      fullName: validated.data.fullName,
      employeeCode: cleanedEmployeeCode || null,
      position: validated.data.position || null,
      dailySalary: validated.data.dailySalary,
      lateDeduction: validated.data.lateDeduction,
      isActive: validated.data.isActive === "true",
    },
  });

  revalidatePath("/admin/employees");
  revalidatePath(`/admin/employees/${employeeId}/edit`);
  redirect("/admin/employees?success=updated");
}