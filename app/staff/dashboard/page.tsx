import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { prisma } from "@/lib/prisma";
import {
  computeMonthlySummary,
  getCurrentMonthYear,
  getMonthDateRange,
} from "@/lib/monthly-summary";
import { StatCard } from "@/components/stat-card";
import { PageContainer } from "@/components/page-container";
import { formatCurrency } from "@/lib/formatters";

type StaffRecordsResult = Awaited<
  ReturnType<typeof prisma.dailyRecord.findMany>
>;
type StaffRecord = StaffRecordsResult[number];

export default async function StaffDashboardPage() {
  const sessionUser = await requireStaff();

  if (!sessionUser.employeeId) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-6 text-red-700">
          Employee profile not found for this account.
        </div>
      </PageContainer>
    );
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: sessionUser.employeeId,
    },
  });

  if (!employee) {
    return (
      <PageContainer>
        <div className="rounded-2xl bg-white border border-red-200 shadow-sm p-6 text-red-700">
          Employee profile not found.
        </div>
      </PageContainer>
    );
  }

  const current = getCurrentMonthYear();
  const { startDate, endDate } = getMonthDateRange(current.month, current.year);

  const records: StaffRecordsResult = await prisma.dailyRecord.findMany({
    where: {
      employeeId: employee.id,
      workDate: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const summary = computeMonthlySummary({
    dailySalary: Number(employee.dailySalary),
    lateDeduction: Number(employee.lateDeduction),
    records: records.map((record: StaffRecord) => ({
      attendanceStatus: record.attendanceStatus,
      isLate: record.isLate,
      dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
    })),
  });

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Staff Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Welcome, {sessionUser.fullName || sessionUser.email}
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Worked Days" value={summary.workedDays} />
        <StatCard label="Late Count" value={summary.lateCount} />
        <StatCard
          label="Job Income"
          value={formatCurrency(summary.jobIncomeTotal)}
        />
        <StatCard
          label="Estimated Salary"
          value={formatCurrency(summary.finalSalary)}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/staff/daily-sheet"
            className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
          >
            Open Daily Sheet
          </Link>

          <Link
            href="/staff/history"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            View History
          </Link>

          <Link
            href="/staff/monthly-summary"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Monthly Summary
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}