"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function getString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export async function createCashAdvanceAction(formData: FormData) {
  await requireAdmin();

  const employeeId = getString(formData.get("employeeId"));
  const advanceDate = getString(formData.get("advanceDate"));
  const amount = Number(getString(formData.get("amount")));
  const note = getString(formData.get("note"));

  if (!employeeId || !advanceDate || !amount || amount <= 0) {
    redirect("/admin/cash-advances/new?error=invalid_input");
  }

  await prisma.cashAdvance.create({
    data: {
      employeeId,
      advanceDate: parseDate(advanceDate),
      amount,
      note: note || "",
    },
  });

  redirect("/admin/cash-advances?success=created");
}

export async function updateCashAdvanceAction(
  cashAdvanceId: string,
  formData: FormData
) {
  await requireAdmin();

  const employeeId = getString(formData.get("employeeId"));
  const advanceDate = getString(formData.get("advanceDate"));
  const amount = Number(getString(formData.get("amount")));
  const note = getString(formData.get("note"));

  if (!employeeId || !advanceDate || !amount || amount <= 0) {
    redirect(`/admin/cash-advances/${cashAdvanceId}/edit?error=invalid_input`);
  }

  await prisma.cashAdvance.update({
    where: {
      id: cashAdvanceId,
    },
    data: {
      employeeId,
      advanceDate: parseDate(advanceDate),
      amount,
      note: note || "",
    },
  });

  redirect("/admin/cash-advances?success=updated");
}

export async function deleteCashAdvanceAction(formData: FormData) {
  await requireAdmin();

  const id = getString(formData.get("id"));

  if (!id) {
    redirect("/admin/cash-advances?error=not_found");
  }

  await prisma.cashAdvance.delete({
    where: {
      id,
    },
  });

  redirect("/admin/cash-advances?success=deleted");
}