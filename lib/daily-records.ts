export const JOB_TYPE_OPTIONS = [
  "Tarpaulin Printing",
  "Document Printing",
  "Lamination",
  "Others",
] as const;

export type JobEntryInput = {
  jobType: string;
  description: string;
  quantity: number;
  amount: number;
  remarks: string;
};

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function createWorkDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

export function isLateByTimeIn(timeIn?: string | null) {
  if (!timeIn) return false;
  return timeIn >= "08:00";
}

export function calculateLateDeduction(isLate: boolean) {
  return isLate ? 100 : 0;
}

export function calculateDailyJobIncomeTotal(entries: JobEntryInput[]) {
  return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

export function parseJobEntriesJson(jobEntriesJson: string): JobEntryInput[] {
  if (!jobEntriesJson) return [];

  try {
    const parsed = JSON.parse(jobEntriesJson);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        jobType: String(item.jobType ?? "").trim(),
        description: String(item.description ?? "").trim(),
        quantity: Number(item.quantity ?? 1),
        amount: Number(item.amount ?? 0),
        remarks: String(item.remarks ?? "").trim(),
      }))
      .filter(
        (item) =>
          item.jobType.length > 0 ||
          item.description.length > 0 ||
          item.amount > 0 ||
          item.quantity > 0 ||
          item.remarks.length > 0
      )
      .map((item) => ({
        ...item,
        quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1,
        amount: Number.isFinite(item.amount) && item.amount > 0 ? item.amount : 0,
      }));
  } catch {
    return [];
  }
}

export function formatAttendanceStatus(status: string) {
  switch (status) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "NO_RECORD":
      return "No Record";
    default:
      return status;
  }
}