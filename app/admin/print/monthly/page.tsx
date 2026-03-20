import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeMonthlySummary, getMonthDateRange } from "@/lib/monthly-summary";
import { formatCurrency, getMonthName } from "@/lib/report-utils";
import { PrintButton } from "@/components/print-button";

type AdminPrintMonthlyPageProps = {
  searchParams?: Promise<{
    month?: string;
    year?: string;
    employeeId?: string;
  }>;
};

export default async function AdminPrintMonthlyPage({
  searchParams,
}: AdminPrintMonthlyPageProps) {
  await requireAdmin();

  const params = await searchParams;

  const month = Number(params?.month ?? new Date().getMonth() + 1);
  const year = Number(params?.year ?? new Date().getFullYear());
  const employeeId = params?.employeeId ?? "all";

  const { startDate, endDate } = getMonthDateRange(month, year);

  const employees = await prisma.employee.findMany({
    where: employeeId !== "all" ? { id: employeeId } : undefined,
    include: {
      user: true,
      cashAdvances: {
        where: {
          advanceDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          advanceDate: "asc",
        },
      },
      dailyRecords: {
        where: {
          workDate: {
            gte: startDate,
            lt: endDate,
          },
        },
        orderBy: {
          workDate: "asc",
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  type PrintEmployeeRow = (typeof employees)[number];
  type PrintEmployeeDailyRecord = PrintEmployeeRow["dailyRecords"][number];
  type PrintCashAdvance = PrintEmployeeRow["cashAdvances"][number];

  const reports = employees.map((employee: PrintEmployeeRow) => {
  const cashAdvanceTotal = employee.cashAdvances.reduce(
    (sum: number, item: PrintCashAdvance) => {
      return sum + Number(item.amount);
    },
    0
  );

    const summary = computeMonthlySummary({
      dailySalary: Number(employee.dailySalary),
      lateDeduction: Number(employee.lateDeduction),
      cashAdvanceTotal,
      records: employee.dailyRecords.map((record: PrintEmployeeDailyRecord) => ({
        attendanceStatus: record.attendanceStatus,
        isLate: record.isLate,
        dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
      })),
    });

    return {
      employee,
      summary,
    };
  });

  type PrintReportRow = (typeof reports)[number];

  return (
    <main className="min-h-screen bg-white text-slate-900 p-6 print:p-0">
      <div className="max-w-6xl mx-auto print:max-w-none">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold">Print Monthly Report</h1>
            <p className="text-slate-600 mt-1">
              {getMonthName(month)} {year}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/exports"
              className="inline-flex rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Back to Exports
            </Link>

            <PrintButton />
          </div>
        </div>

        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold">AVG Printing Shop</h1>
          <p className="mt-1">
            Monthly Report — {getMonthName(month)} {year}
          </p>
        </div>

        <div className="space-y-8">
          {reports.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-6">
              No records found for this report.
            </div>
          ) : (
            reports.map((report: PrintReportRow, index: number) => {
              const employee = report.employee;
              const summary = report.summary;

              return (
                <section
                  key={employee.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden print:rounded-none print:border-black"
                >
                  <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 print:bg-white">
                    <h2 className="text-xl font-bold">{employee.fullName}</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      {employee.user.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="border-b md:border-b-0 md:border-r border-slate-200 p-6">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Worked Days</span>
                          <span className="font-medium">{summary.workedDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late Count</span>
                          <span className="font-medium">{summary.lateCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late Deductions</span>
                          <span className="font-medium">
                            {formatCurrency(summary.lateDeductions)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Base Salary</span>
                          <span className="font-medium">
                            {formatCurrency(summary.baseSalary)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Job Income Total</span>
                          <span className="font-medium">
                            {formatCurrency(summary.jobIncomeTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bonus</span>
                          <span className="font-medium">
                            {formatCurrency(summary.bonus)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cash Advance Total</span>
                          <span className="font-medium">
                            {formatCurrency(summary.cashAdvanceTotal)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-slate-200 text-base">
                          <span className="font-semibold">Final Salary</span>
                          <span className="font-bold">
                            {formatCurrency(summary.finalSalary)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 p-6">
                    <h3 className="text-lg font-semibold mb-3">Cash Advances</h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm mb-6">
                        <thead className="border-b border-slate-200 bg-slate-50 print:bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Amount</th>
                            <th className="px-4 py-3 text-left font-semibold">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employee.cashAdvances.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="px-4 py-4 text-center text-slate-500">
                                No cash advances found.
                              </td>
                            </tr>
                          ) : (
                            employee.cashAdvances.map((advance: PrintCashAdvance) => (
                              <tr key={advance.id} className="border-b border-slate-100">
                                <td className="px-4 py-3">
                                  {advance.advanceDate.toISOString().slice(0, 10)}
                                </td>
                                <td className="px-4 py-3">
                                  {formatCurrency(Number(advance.amount))}
                                </td>
                                <td className="px-4 py-3">{advance.note || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-lg font-semibold mb-3">Daily Records</h3>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-t border-b border-slate-200 bg-slate-50 print:bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Date</th>
                            <th className="px-4 py-3 text-left font-semibold">Attendance</th>
                            <th className="px-4 py-3 text-left font-semibold">Time In</th>
                            <th className="px-4 py-3 text-left font-semibold">Late</th>
                            <th className="px-4 py-3 text-left font-semibold">Job Total</th>
                            <th className="px-4 py-3 text-left font-semibold">Notes</th>
                          </tr>
                        </thead>

                        <tbody>
                          {employee.dailyRecords.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                                No daily records found.
                              </td>
                            </tr>
                          ) : (
                            employee.dailyRecords.map((record: PrintEmployeeDailyRecord) => (
                              <tr
                                key={record.id}
                                className="border-b border-slate-100 print:border-slate-300"
                              >
                                <td className="px-4 py-3">
                                  {record.workDate.toISOString().slice(0, 10)}
                                </td>
                                <td className="px-4 py-3">{record.attendanceStatus}</td>
                                <td className="px-4 py-3">{record.timeIn || "-"}</td>
                                <td className="px-4 py-3">{record.isLate ? "Yes" : "No"}</td>
                                <td className="px-4 py-3">
                                  {formatCurrency(Number(record.dailyJobIncomeTotal))}
                                </td>
                                <td className="px-4 py-3">{record.notes || "-"}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {index < reports.length - 1 ? (
                    <div className="hidden print:block break-after-page" />
                  ) : null}
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}