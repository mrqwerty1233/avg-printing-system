import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthYear } from "@/lib/monthly-summary";

type AdminExportsPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
    employeeId?: string;
  }>;
};

type EmployeesResult = Awaited<ReturnType<typeof prisma.employee.findMany>>;
type EmployeeRow = EmployeesResult[number];

export default async function AdminExportsPage({
  searchParams,
}: AdminExportsPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const current = getCurrentMonthYear();

  const selectedMonth = Number(params?.month ?? current.month);
  const selectedYear = Number(params?.year ?? current.year);
  const selectedEmployeeId = params?.employeeId ?? "all";

  const employees: EmployeesResult = await prisma.employee.findMany({
    include: {
      user: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const csvUrl = `/api/exports/monthly?month=${selectedMonth}&year=${selectedYear}&employeeId=${selectedEmployeeId}`;
  const printUrl = `/admin/print/monthly?month=${selectedMonth}&year=${selectedYear}&employeeId=${selectedEmployeeId}`;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Exports</h1>
            <p className="text-slate-600 mt-1">
              Download monthly reports or open a print-friendly report page.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Employee
              </label>
              <select
                name="employeeId"
                defaultValue={selectedEmployeeId}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="all">All Employees</option>
                {employees.map((employee: EmployeeRow) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition"
              >
                Apply
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={csvUrl}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Download CSV
            </h2>
            <p className="text-slate-600 mt-2">
              Export the selected monthly report to a CSV file that opens in Excel.
            </p>
          </a>

          <Link
            href={printUrl}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition"
          >
            <h2 className="text-lg font-semibold text-slate-900">
              Open Print View
            </h2>
            <p className="text-slate-600 mt-2">
              Open a clean print-friendly page for the selected report.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}