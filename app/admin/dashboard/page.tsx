import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
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

function getTodayRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return { startDate, endDate };
}

export default async function AdminDashboardPage() {
  const sessionUser = await requireAdmin();

  const totalEmployees = await prisma.employee.count({
    where: {
      user: {
        role: "STAFF",
      },
    },
  });

  const { startDate, endDate } = getTodayRange();

  const todayRecords = await prisma.dailyRecord.findMany({
    where: {
      workDate: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  type TodayRecord = (typeof todayRecords)[number];

  const presentToday = todayRecords.filter(
    (record: TodayRecord) => record.attendanceStatus === "PRESENT"
  ).length;

  const lateToday = todayRecords.filter(
    (record: TodayRecord) => record.isLate
  ).length;

  const current = getCurrentMonthYear();
  const monthRange = getMonthDateRange(current.month, current.year);

  const employees = await prisma.employee.findMany({
    where: {
      user: {
        role: "STAFF",
      },
    },
    include: {
      dailyRecords: {
        where: {
          workDate: {
            gte: monthRange.startDate,
            lt: monthRange.endDate,
          },
        },
      },
    },
  });

  type EmployeePayrollRow = (typeof employees)[number];
  type EmployeeDailyRecord = EmployeePayrollRow["dailyRecords"][number];

  const totalPayroll = employees.reduce(
    (sum: number, employee: EmployeePayrollRow) => {
      const summary = computeMonthlySummary({
        dailySalary: Number(employee.dailySalary),
        lateDeduction: Number(employee.lateDeduction),
        records: employee.dailyRecords.map((record: EmployeeDailyRecord) => ({
          attendanceStatus: record.attendanceStatus,
          isLate: record.isLate,
          dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
        })),
      });

      return sum + summary.finalSalary;
    },
    0
  );

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Welcome, {sessionUser.fullName || sessionUser.email}
          </p>
        </div>

        <LogoutButton />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={totalEmployees} />
        <StatCard label="Present Today" value={presentToday} />
        <StatCard label="Late Today" value={lateToday} />
        <StatCard
          label="Current Month Payroll"
          value={formatCurrency(totalPayroll)}
        />
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Quick Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/employees"
            className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
          >
            Manage Employees
          </Link>

          <Link
            href="/admin/employees/new"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Add Employee
          </Link>

          <Link
            href="/admin/daily-records"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            View Daily Records
          </Link>

          <Link
            href="/admin/monthly-summaries"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            View Monthly Summaries
          </Link>

          <Link
            href="/admin/exports"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Exports
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}