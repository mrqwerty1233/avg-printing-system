export type MonthlySummaryRecord = {
  attendanceStatus: "PRESENT" | "ABSENT" | "NO_RECORD";
  isLate: boolean;
  dailyJobIncomeTotal: number;
};

export type ComputeMonthlySummaryInput = {
  dailySalary: number;
  lateDeduction: number;
  records: MonthlySummaryRecord[];
  cashAdvanceTotal?: number;
};

export type MonthlySummaryResult = {
  workedDays: number;
  lateCount: number;
  lateDeductions: number;
  baseSalary: number;
  jobIncomeTotal: number;
  bonus: number;
  cashAdvanceTotal: number;
  finalSalary: number;
};

export function getCurrentMonthYear() {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function getMonthDateRange(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return { startDate, endDate };
}

export function computeMonthlySummary({
  dailySalary,
  lateDeduction,
  records,
  cashAdvanceTotal = 0,
}: ComputeMonthlySummaryInput): MonthlySummaryResult {
  const workedDays = records.filter(
    (record) => record.attendanceStatus === "PRESENT"
  ).length;

  const lateCount = records.filter(
    (record) => record.attendanceStatus === "PRESENT" && record.isLate
  ).length;

  const lateDeductions = lateCount * lateDeduction;

  const baseSalary = workedDays * dailySalary;

  const jobIncomeTotal = records.reduce((sum, record) => {
    return sum + Number(record.dailyJobIncomeTotal || 0);
  }, 0);

  const bonus = jobIncomeTotal >= 30000 ? 1000 : 0;

  const finalSalary =
    baseSalary +
    jobIncomeTotal +
    bonus -
    lateDeductions -
    Number(cashAdvanceTotal || 0);

  return {
    workedDays,
    lateCount,
    lateDeductions,
    baseSalary,
    jobIncomeTotal,
    bonus,
    cashAdvanceTotal: Number(cashAdvanceTotal || 0),
    finalSalary,
  };
}