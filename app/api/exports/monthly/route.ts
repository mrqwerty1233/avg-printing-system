import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { computeMonthlySummary, getMonthDateRange } from "@/lib/monthly-summary";
import { buildCsv, getMonthName } from "@/lib/report-utils";

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();

  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  const employeeId = searchParams.get("employeeId");

  if (!month || !year) {
    return new NextResponse("Month and year are required.", { status: 400 });
  }

  const { startDate, endDate } = getMonthDateRange(month, year);

  const employees = await prisma.employee.findMany({
    where: employeeId && employeeId !== "all" ? { id: employeeId } : undefined,
    include: {
      user: true,
      dailyRecords: {
        where: {
          workDate: {
            gte: startDate,
            lt: endDate,
          },
        },
      },
    },
    orderBy: {
      fullName: "asc",
    },
  });

  type ExportEmployeeRow = (typeof employees)[number];
  type ExportEmployeeDailyRecord = ExportEmployeeRow["dailyRecords"][number];

  const rows: Array<Array<string | number>> = [
    [
      "Employee Name",
      "Email",
      "Worked Days",
      "Late Count",
      "Late Deductions",
      "Base Salary",
      "Job Income Total",
      "Bonus",
      "Final Salary",
    ],
  ];

  for (const employee of employees) {
    const typedEmployee: ExportEmployeeRow = employee;

    const summary = computeMonthlySummary({
      dailySalary: Number(typedEmployee.dailySalary),
      lateDeduction: Number(typedEmployee.lateDeduction),
      records: typedEmployee.dailyRecords.map(
        (record: ExportEmployeeDailyRecord) => ({
          attendanceStatus: record.attendanceStatus,
          isLate: record.isLate,
          dailyJobIncomeTotal: Number(record.dailyJobIncomeTotal),
        })
      ),
    });

    rows.push([
      typedEmployee.fullName,
      typedEmployee.user.email,
      summary.workedDays,
      summary.lateCount,
      summary.lateDeductions.toFixed(2),
      summary.baseSalary.toFixed(2),
      summary.jobIncomeTotal.toFixed(2),
      summary.bonus.toFixed(2),
      summary.finalSalary.toFixed(2),
    ]);
  }

  const csv = buildCsv(rows);
  const fileName = `monthly-report-${getMonthName(month)}-${year}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}