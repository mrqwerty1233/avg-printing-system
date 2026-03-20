"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

type JobEntryInput = {
  jobType: string;
  description: string;
  quantity: number;
  amount: number;
  remarks: string;
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeJobEntries(formData: FormData): JobEntryInput[] {
  const raw = getString(formData, "jobEntries");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Array<{
      jobType?: string;
      description?: string;
      quantity?: number | string;
      amount?: number | string;
      remarks?: string;
    }>;

    return parsed
      .map((entry) => ({
        jobType: String(entry.jobType ?? "").trim(),
        description: String(entry.description ?? "").trim(),
        quantity: getNumber(String(entry.quantity ?? 0)),
        amount: getNumber(String(entry.amount ?? 0)),
        remarks: String(entry.remarks ?? "").trim(),
      }))
      .filter((entry) => {
        return (
          entry.jobType !== "" ||
          entry.description !== "" ||
          entry.quantity > 0 ||
          entry.amount > 0 ||
          entry.remarks !== ""
        );
      });
  } catch {
    return [];
  }
}

function parseWorkDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function normalizeTimeIn(timeIn: string, attendanceStatus: string) {
  if (attendanceStatus !== "PRESENT") {
    return null;
  }

  return timeIn || null;
}

function isLateTime(timeIn: string | null, attendanceStatus: string) {
  if (attendanceStatus !== "PRESENT" || !timeIn) {
    return false;
  }

  return timeIn >= "08:00";
}

export async function saveDailySheetAction(formData: FormData) {
  const sessionUser = await requireStaff();

  const workDate = getString(formData, "workDate");
  const attendanceStatus = getString(formData, "attendanceStatus");
  const timeIn = getString(formData, "timeIn");
  const notes = getString(formData, "notes");
  const jobEntries = normalizeJobEntries(formData);

  if (!workDate || !attendanceStatus) {
    redirect(`/staff/daily-sheet?date=${workDate}&error=missing_fields`);
  }

  const employee = await prisma.employee.findFirst({
    where: {
      userId: sessionUser.id,
    },
  });

  if (!employee) {
    redirect("/unauthorized");
  }

  const normalizedTimeIn = normalizeTimeIn(timeIn, attendanceStatus);
  const isLate = isLateTime(normalizedTimeIn, attendanceStatus);
  const lateDeductionAmount =
    attendanceStatus === "PRESENT" && isLate
      ? Number(employee.lateDeduction)
      : 0;

  const dailyJobIncomeTotal = jobEntries.reduce((sum, entry) => {
    return sum + Number(entry.amount || 0);
  }, 0);

  const parsedWorkDate = parseWorkDate(workDate);

  const existingRecord = await prisma.dailyRecord.findFirst({
    where: {
      employeeId: employee.id,
      workDate: parsedWorkDate,
    },
  });

  if (existingRecord) {
    await prisma.$transaction(async (tx) => {
      await tx.jobEntry.deleteMany({
        where: {
          dailyRecordId: existingRecord.id,
        },
      });

      await tx.dailyRecord.update({
        where: {
          id: existingRecord.id,
        },
        data: {
          attendanceStatus: attendanceStatus as "PRESENT" | "ABSENT" | "NO_RECORD",
          timeIn: normalizedTimeIn,
          isLate,
          lateDeductionAmount,
          notes: notes || null,
          dailyJobIncomeTotal,
        },
      });

      if (jobEntries.length > 0) {
        await tx.jobEntry.createMany({
          data: jobEntries.map((entry) => ({
            dailyRecordId: existingRecord.id,
            jobType: entry.jobType || "",
            description: entry.description || null,
            quantity: entry.quantity,
            amount: entry.amount,
            remarks: entry.remarks || null,
          })),
        });
      }
    });
  } else {
    await prisma.$transaction(async (tx) => {
      const dailyRecord = await tx.dailyRecord.create({
        data: {
          employeeId: employee.id,
          workDate: parsedWorkDate,
          attendanceStatus: attendanceStatus as "PRESENT" | "ABSENT" | "NO_RECORD",
          timeIn: normalizedTimeIn,
          isLate,
          lateDeductionAmount,
          notes: notes || null,
          dailyJobIncomeTotal,
        },
      });

      if (jobEntries.length > 0) {
        await tx.jobEntry.createMany({
          data: jobEntries.map((entry) => ({
            dailyRecordId: dailyRecord.id,
            jobType: entry.jobType || "",
            description: entry.description || null,
            quantity: entry.quantity,
            amount: entry.amount,
            remarks: entry.remarks || null,
          })),
        });
      }
    });
  }

  redirect(`/staff/daily-sheet?date=${workDate}&success=saved`);
}