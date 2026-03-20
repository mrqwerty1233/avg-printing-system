type MonthlySummaryInput = {
  dailySalary: number;
  lateDeduction: number;
  records: Array<{
    attendanceStatus: string;
    isLate: boolean;
    dailyJobIncomeTotal: number;
  }>;
};

export function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return { startDate, endDate };
}

export function computeMonthlySummary({
  dailySalary,
  lateDeduction,
  records,
}: MonthlySummaryInput) {
  const workedDays = records.filter(
    (record) => record.attendanceStatus === "PRESENT"
  ).length;

  const lateCount = records.filter(
    (record) => record.attendanceStatus === "PRESENT" && record.isLate
  ).length;

  const lateDeductions = lateCount * lateDeduction;

  const baseSalary = workedDays * dailySalary;

  const jobIncomeTotal = records.reduce(
    (sum, record) => sum + Number(record.dailyJobIncomeTotal || 0),
    0
  );

  const bonus = jobIncomeTotal >= 30000 ? 1000 : 0;

  const finalSalary = baseSalary - lateDeductions + bonus;

  return {
    workedDays,
    lateCount,
    lateDeductions,
    baseSalary,
    jobIncomeTotal,
    bonus,
    finalSalary,
  };
}

export function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}