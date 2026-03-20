import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatAttendanceStatus,
  formatCurrency,
  formatDateOnly,
  formatYesNo,
} from "@/lib/formatters";

type AdminDailyRecordsPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export default async function AdminDailyRecordsPage({
  searchParams,
}: AdminDailyRecordsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const current = getCurrentMonthYear();

  const selectedMonth = Number(params?.month ?? current.month);
  const selectedYear = Number(params?.year ?? current.year);

  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 1);

  const records = await prisma.dailyRecord.findMany({
    where: {
      workDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    include: {
      employee: true,
    },
    orderBy: [{ workDate: "desc" }, { createdAt: "desc" }],
  });

  type DailyRecordRow = (typeof records)[number];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Daily Records</h1>
            <p className="text-slate-600 mt-1">
              Review all employee daily attendance and job totals.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Month
              </label>
              <input
                type="number"
                name="month"
                min="1"
                max="12"
                defaultValue={selectedMonth}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                defaultValue={selectedYear}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Employee
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Attendance
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Time In
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Late
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Late Deduction
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Daily Job Total
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Notes
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No daily records found for this month.
                    </td>
                  </tr>
                ) : (
                  records.map((record: DailyRecordRow) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {formatDateOnly(record.workDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.employee.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatAttendanceStatus(record.attendanceStatus)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.timeIn || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatYesNo(record.isLate)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(Number(record.lateDeductionAmount))}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(Number(record.dailyJobIncomeTotal))}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.notes || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/daily-records/${record.id}/edit`}
                          className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}