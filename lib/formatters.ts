export function formatCurrency(value: number) {
  return `₱${value.toFixed(2)}`;
}

export function formatWholeCurrency(value: number) {
  return `₱${Math.round(value)}`;
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

export function formatYesNo(value: boolean) {
  return value ? "Yes" : "No";
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}