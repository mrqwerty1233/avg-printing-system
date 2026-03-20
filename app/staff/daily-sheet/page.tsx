import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DailySheetForm } from "@/components/daily-sheet-form";
import { getTodayDateString, createWorkDate } from "@/lib/daily-records";
import { saveDailySheetAction } from "./actions";

type DailySheetPageProps = {
  searchParams?: Promise<{
    date?: string;
    success?: string;
    error?: string;
  }>;
};

export default async function StaffDailySheetPage({
  searchParams,
}: DailySheetPageProps) {
  const sessionUser = await requireStaff();
  const params = await searchParams;

  const selectedDate = params?.date || getTodayDateString();

  const existingRecord = sessionUser.employeeId
    ? await prisma.dailyRecord.findUnique({
        where: {
          employeeId_workDate: {
            employeeId: sessionUser.employeeId,
            workDate: createWorkDate(selectedDate),
          },
        },
        include: {
          jobEntries: true,
        },
      })
    : null;

  type ExistingJobEntry =
    NonNullable<typeof existingRecord>["jobEntries"][number];

  const defaultJobEntries =
    existingRecord?.jobEntries.map((entry: ExistingJobEntry) => ({
      jobType: entry.jobType ?? "",
      description: entry.description ?? "",
      quantity: entry.quantity,
      amount: Number(entry.amount),
      remarks: entry.remarks ?? "",
    })) ?? [];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Daily Sheet</h1>
            <p className="mt-1 text-slate-600">
              Record attendance, job entries, and notes for one date.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/staff/dashboard"
              className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Dashboard
            </Link>

            <Link
              href="/staff/history"
              className="inline-flex rounded-xl bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 transition"
            >
              View History
            </Link>
          </div>
        </div>

        <DailySheetForm
          action={saveDailySheetAction}
          storageKeyBase={`daily-sheet-draft:${sessionUser.employeeId ?? "unknown"}`}
          success={params?.success}
          error={params?.error}
          defaultValues={{
            workDate: selectedDate,
            timeIn: existingRecord?.timeIn ?? "",
            attendanceStatus: existingRecord?.attendanceStatus ?? "PRESENT",
            notes: existingRecord?.notes ?? "",
            jobEntries: defaultJobEntries,
          }}
        />
      </div>
    </main>
  );
}