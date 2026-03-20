import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { formatDateOnly } from "@/lib/formatters";

type EditDailyRecordPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function updateDailyRecordAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const attendanceStatus = String(formData.get("attendanceStatus") ?? "").trim() as
    | "PRESENT"
    | "ABSENT"
    | "NO_RECORD";
  const timeIn = String(formData.get("timeIn") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const record = await prisma.dailyRecord.findUnique({
    where: { id },
  });

  if (!record) {
    redirect("/admin/daily-records");
  }

  const isLate =
    attendanceStatus === "PRESENT" && timeIn ? timeIn >= "08:00" : false;

  const lateDeductionAmount = isLate ? 100 : 0;

  await prisma.dailyRecord.update({
    where: {
      id,
    },
    data: {
      attendanceStatus,
      timeIn: attendanceStatus === "PRESENT" ? timeIn || null : null,
      isLate,
      lateDeductionAmount,
      notes: notes || null,
    },
  });

  revalidatePath("/admin/daily-records");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/monthly-summaries");
  revalidatePath("/staff/history");
  revalidatePath("/staff/dashboard");
  revalidatePath("/staff/monthly-summary");

  redirect("/admin/daily-records");
}

export default async function EditDailyRecordPage({
  params,
}: EditDailyRecordPageProps) {
  await requireAdmin();

  const { id } = await params;

  const record = await prisma.dailyRecord.findUnique({
    where: {
      id,
    },
    include: {
      employee: true,
    },
  });

  if (!record) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/daily-records"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Daily Records
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900">Edit Daily Record</h1>
          <p className="text-slate-600 mt-2">
            Employee: {record.employee.fullName}
          </p>
          <p className="text-slate-600">
            Date: {formatDateOnly(record.workDate)}
          </p>

          <form action={updateDailyRecordAction} className="mt-6 space-y-5">
            <input type="hidden" name="id" value={record.id} />

            <div>
              <label
                htmlFor="attendanceStatus"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Attendance Status
              </label>
              <select
                id="attendanceStatus"
                name="attendanceStatus"
                defaultValue={record.attendanceStatus}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="NO_RECORD">No Record</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timeIn"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Time In
              </label>
              <input
                id="timeIn"
                name="timeIn"
                type="time"
                defaultValue={record.timeIn ?? ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Notes
              </label>
              <input
                id="notes"
                name="notes"
                defaultValue={record.notes ?? ""}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
            >
              Update Daily Record
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}