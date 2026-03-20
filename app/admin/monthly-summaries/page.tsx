import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeMonthlySummary,
  getCurrentMonthYear,
  getMonthDateRange,
} from "@/lib/monthly-summary";

type AdminMonthlySummariesPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
};

type SummaryRow = {
  employeeId: string;
  fullName: string;
  email: string;
  dailySalary: number;
  lateDeduction: number;
  workedDays: number;
  lateCount: number;
  lateDeductions: number;
  baseSalary: number;
  jobIncomeTotal: number;
  bonus: number;
  cashAdvanceTotal: number;
  finalSalary: number;
};

export default async function AdminMonthlySummariesPage({
  searchParams,
}: AdminMonthlySummariesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const current = getCurrentMonthYear();

  const selectedMonth = Number(params?.month ?? current.month);
  const selectedYear = Number(params?.year ?? current.year);

  const { startDate, endDate } = getMonthDateRange(selectedMonth, selectedYear);

  const employees = await prisma.employee.findMany({
    include: {
      dailyRecords: {
        where: {
          workDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      cashAdvances: {
        where: {
          advanceDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
      user: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  type EmployeeMonthlyRow = (typeof employees)[number];
  type EmployeeDailyRecord = EmployeeMonthlyRow["dailyRecords"][number];
  type EmployeeCashAdvance = EmployeeMonthlyRow["cashAdvances"][number];

  const rows: SummaryRow[] = employees.map((employee: EmployeeMonthlyRow) => {
type EmployeeCashAdvance = EmployeeMonthlyRow["cashAdvances"][number];

const cashAdvanceTotal = employee.cashAdvances.reduce(
  (sum: number, item: EmployeeCashAdvance) => {
    return sum + Number(item.amount);
  },
  0
);

    const summary = computeMonthlySummary({
      dailySalary: Number(employee.dailySalary),
      lateDeduction: Number(employee.lateDeduction),
      cashAdvanceTotal,
      records: employee.dailyRecords.map((record: EmployeeDailyRecord) => ({
        attendanceStatus: record.attendanceStatus,
        isLate: record.isLate,
        dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
      })),
    });

    return {
      employeeId: employee.id,
      fullName: employee.fullName,
      email: employee.user.email,
      dailySalary: Number(employee.dailySalary),
      lateDeduction: Number(employee.lateDeduction),
      ...summary,
    };
  });

  const totalPayroll = rows.reduce(
    (sum: number, row: SummaryRow) => sum + row.finalSalary,
    0
  );

  const totalJobIncome = rows.reduce(
    (sum: number, row: SummaryRow) => sum + row.jobIncomeTotal,
    0
  );

  const totalCashAdvances = rows.reduce(
    (sum: number, row: SummaryRow) => sum + row.cashAdvanceTotal,
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Monthly Summaries
            </h1>
            <p className="text-slate-600 mt-1">
              Review monthly salary computation for all employees.
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
                View Summaries
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Payroll</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              ₱{totalPayroll.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Job Income</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              ₱{totalJobIncome.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Cash Advances</p>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              ₱{totalCashAdvances.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Employee</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Worked Days</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Late Count</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Late Deductions</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Base Salary</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Job Income</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Bonus</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Cash Advance</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Final Salary</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row: SummaryRow) => (
                    <tr key={row.employeeId} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{row.fullName}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.workedDays}</td>
                      <td className="px-4 py-3 text-slate-700">{row.lateCount}</td>
                      <td className="px-4 py-3 text-red-600">₱{row.lateDeductions.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">₱{row.baseSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">₱{row.jobIncomeTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-green-600">₱{row.bonus.toFixed(2)}</td>
                      <td className="px-4 py-3 text-orange-600">₱{row.cashAdvanceTotal.toFixed(2)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">₱{row.finalSalary.toFixed(2)}</td>
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