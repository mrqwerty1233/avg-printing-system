import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatAttendanceStatus } from "@/lib/daily-records";

type StaffHistoryPageProps = {
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

export default async function StaffHistoryPage({
  searchParams,
}: StaffHistoryPageProps) {
  const sessionUser = await requireStaff();
  const params = await searchParams;
  const current = getCurrentMonthYear();

  const selectedMonth = Number(params?.month ?? current.month);
  const selectedYear = Number(params?.year ?? current.year);

  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 1);

  const records = sessionUser.employeeId
    ? await prisma.dailyRecord.findMany({
        where: {
          employeeId: sessionUser.employeeId,
          workDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          workDate: "desc",
        },
      })
    : [];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Daily History</h1>
            <p className="text-slate-600 mt-1">
              Review your saved daily sheets by month.
            </p>
          </div>

          <Link
            href="/staff/daily-sheet"
            className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
          >
            Open Daily Sheet
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
                    Attendance
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Time In
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Late
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Daily Job Total
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Notes
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No daily records found for this month.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {record.workDate.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatAttendanceStatus(record.attendanceStatus)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.timeIn || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.isLate ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        ₱{Number(record.dailyJobIncomeTotal).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.notes || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/staff/daily-sheet?date=${record.workDate
                            .toISOString()
                            .slice(0, 10)}`}
                          className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                        >
                          Open
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