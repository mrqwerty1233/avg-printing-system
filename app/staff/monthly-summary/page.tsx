import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeMonthlySummary,
  getCurrentMonthYear,
  getMonthDateRange,
} from "@/lib/monthly-summary";

type StaffMonthlySummaryPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

type StaffMonthlyRecordsResult = Awaited<
  ReturnType<typeof prisma.dailyRecord.findMany>
>;
type StaffMonthlyRecord = StaffMonthlyRecordsResult[number];

export default async function StaffMonthlySummaryPage({
  searchParams,
}: StaffMonthlySummaryPageProps) {
  const sessionUser = await requireStaff();
  const params = await searchParams;
  const current = getCurrentMonthYear();

  const selectedMonth = Number(params?.month ?? current.month);
  const selectedYear = Number(params?.year ?? current.year);

  if (!sessionUser.employeeId) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-red-200 shadow-sm p-6 text-red-700">
          Employee profile not found for this account.
        </div>
      </main>
    );
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: sessionUser.employeeId,
    },
  });

  if (!employee) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-red-200 shadow-sm p-6 text-red-700">
          Employee profile not found.
        </div>
      </main>
    );
  }

  const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);

  const records: StaffMonthlyRecordsResult = await prisma.dailyRecord.findMany({
    where: {
      employeeId: employee.id,
      workDate: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: {
      workDate: "asc",
    },
  });

  const summary = computeMonthlySummary({
    dailySalary: Number(employee.dailySalary),
    lateDeduction: Number(employee.lateDeduction),
    records: records.map((record: StaffMonthlyRecord) => ({
      attendanceStatus: record.attendanceStatus,
      isLate: record.isLate,
      dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
    })),
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Monthly Summary
            </h1>
            <p className="text-slate-600 mt-1">
              Review your salary, late deductions, and monthly totals.
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
              className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
            >
              View History
            </Link>
          </div>
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
                View Summary
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Summary for {selectedMonth}/{selectedYear}
              </h2>
              <p className="text-slate-600 mt-1">
                Employee: {employee.fullName}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Daily Salary: ₱{Number(employee.dailySalary).toFixed(2)} <br />
              Late Deduction: ₱{Number(employee.lateDeduction).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Worked Days</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {summary.workedDays}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Late Count</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              {summary.lateCount}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Job Income</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              ₱{summary.jobIncomeTotal.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Final Salary</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              ₱{summary.finalSalary.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Salary Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Worked Days</span>
                  <span className="font-medium text-slate-900">
                    {summary.workedDays}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Daily Salary</span>
                  <span className="font-medium text-slate-900">
                    ₱{Number(employee.dailySalary).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Base Salary</span>
                  <span className="font-medium text-slate-900">
                    ₱{summary.baseSalary.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Late Count</span>
                  <span className="font-medium text-slate-900">
                    {summary.lateCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Late Deductions</span>
                  <span className="font-medium text-red-600">
                    - ₱{summary.lateDeductions.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Job Income Total</span>
                  <span className="font-medium text-slate-900">
                    ₱{summary.jobIncomeTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Bonus</span>
                  <span className="font-medium text-green-600">
                    ₱{summary.bonus.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-base font-semibold text-slate-900">
                    Final Salary
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    ₱{summary.finalSalary.toFixed(2)}
                  </span>
                </div>

                <div className="text-xs text-slate-500 pt-2">
                  Bonus rule: add ₱1,000 if job income reaches ₱30,000 or more.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">
              Monthly Daily Records
            </h2>
          </div>

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
                    Job Total
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No records found for this month.
                    </td>
                  </tr>
                ) : (
                  records.map((record: StaffMonthlyRecord) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {record.workDate.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {record.attendanceStatus}
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