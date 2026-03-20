export function getMonthName(month: number) {
  const names = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return names[month - 1] ?? `Month ${month}`;
}

export function formatCurrency(value: number) {
  return `₱${value.toFixed(2)}`;
}

function escapeCsvValue(value: string | number) {
  const stringValue = String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function buildCsv(rows: Array<Array<string | number>>) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}