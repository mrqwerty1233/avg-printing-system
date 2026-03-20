"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  calculateDailyJobIncomeTotal,
  calculateLateDeduction,
  createWorkDate,
  isLateByTimeIn,
  parseJobEntriesJson,
} from "@/lib/daily-records";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function normalizeString(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function saveDailySheetAction(formData: FormData): Promise<void> {
  const sessionUser = await requireStaff();

  if (!sessionUser.employeeId) {
    redirect("/staff/daily-sheet?error=employee_not_found");
  }

  const workDateString = normalizeString(formData.get("workDate"));
  const attendanceStatus = normalizeString(formData.get("attendanceStatus")) as
    | "PRESENT"
    | "ABSENT"
    | "NO_RECORD";
  const timeIn = normalizeString(formData.get("timeIn"));
  const notes = normalizeString(formData.get("notes"));
  const jobEntriesJson = normalizeString(formData.get("jobEntriesJson"));

  if (!workDateString || !attendanceStatus) {
    redirect("/staff/daily-sheet?error=invalid_input");
  }

  const workDate = createWorkDate(workDateString);

  let jobEntries = parseJobEntriesJson(jobEntriesJson);

  jobEntries = jobEntries.filter((entry) => {
    const hasText =
      entry.jobType.trim().length > 0 ||
      entry.description.trim().length > 0 ||
      entry.remarks.trim().length > 0;

    const hasNumbers = Number(entry.quantity) > 0 || Number(entry.amount) > 0;

    return hasText || hasNumbers;
  });

  if (attendanceStatus !== "PRESENT") {
    jobEntries = [];
  }

  if (attendanceStatus === "PRESENT" && !timeIn) {
    redirect(`/staff/daily-sheet?date=${workDateString}&error=invalid_input`);
  }

  if (attendanceStatus === "PRESENT" && jobEntries.length === 0) {
    redirect(`/staff/daily-sheet?date=${workDateString}&error=invalid_input`);
  }

  const isLate = attendanceStatus === "PRESENT" ? isLateByTimeIn(timeIn) : false;
  const lateDeductionAmount = calculateLateDeduction(isLate);
  const dailyJobIncomeTotal =
    attendanceStatus === "PRESENT"
      ? calculateDailyJobIncomeTotal(jobEntries)
      : 0;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const dailyRecord = await tx.dailyRecord.upsert({
      where: {
        employeeId_workDate: {
          employeeId: sessionUser.employeeId!,
          workDate,
        },
      },
      update: {
        timeIn: attendanceStatus === "PRESENT" ? timeIn || null : null,
        attendanceStatus,
        isLate,
        lateDeductionAmount,
        notes: notes || null,
        dailyJobIncomeTotal,
      },
      create: {
        employeeId: sessionUser.employeeId!,
        workDate,
        timeIn: attendanceStatus === "PRESENT" ? timeIn || null : null,
        attendanceStatus,
        isLate,
        lateDeductionAmount,
        notes: notes || null,
        dailyJobIncomeTotal,
      },
    });

    await tx.jobEntry.deleteMany({
      where: {
        dailyRecordId: dailyRecord.id,
      },
    });

      if (jobEntries.length > 0) {
        await tx.jobEntry.createMany({
          data: jobEntries.map((entry) => ({
            dailyRecordId: dailyRecord.id,
            jobType: entry.jobType || "",
            description: entry.description || "",
            quantity: entry.quantity || 1,
            amount: entry.amount || 0,
            remarks: entry.remarks || "",
          })),
        });
      }
  });

  revalidatePath("/staff/daily-sheet");
  revalidatePath("/staff/history");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/monthly-summary");
  revalidatePath("/admin/daily-records");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/monthly-summaries");
  revalidatePath("/admin/print/monthly");

  redirect(`/staff/daily-sheet?date=${workDateString}&success=saved`);
}