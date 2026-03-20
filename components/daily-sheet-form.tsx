"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SubmitButton } from "./submit-button";
import { type JobEntryInput } from "@/lib/daily-records";

type DailySheetFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  storageKeyBase: string;
  defaultValues: {
    workDate: string;
    timeIn?: string | null;
    attendanceStatus?: "PRESENT" | "ABSENT" | "NO_RECORD";
    notes?: string | null;
    jobEntries?: JobEntryInput[];
  };
  success?: string;
  error?: string;
};

type DailySheetDraft = {
  workDate: string;
  timeIn: string;
  attendanceStatus: "PRESENT" | "ABSENT" | "NO_RECORD";
  notes: string;
  jobEntries: JobEntryInput[];
};

type FormState = {
  workDate: string;
  timeIn: string;
  attendanceStatus: "PRESENT" | "ABSENT" | "NO_RECORD";
  notes: string;
  jobEntries: JobEntryInput[];
};

function getBannerMessage(success?: string, error?: string) {
  if (success === "saved") {
    return {
      type: "success" as const,
      message: "Daily sheet saved successfully.",
    };
  }

  if (error === "invalid_input") {
    return {
      type: "error" as const,
      message: "Please check the daily sheet fields and try again.",
    };
  }

  if (error === "employee_not_found") {
    return {
      type: "error" as const,
      message: "Employee profile not found for this account.",
    };
  }

  return null;
}

const EMPTY_ROW: JobEntryInput = {
  jobType: "",
  description: "",
  quantity: 1,
  amount: 0,
  remarks: "",
};

const MIN_ROWS = 30;

function buildSheetRows(existingRows?: JobEntryInput[]) {
  const rows = existingRows && existingRows.length > 0 ? [...existingRows] : [];
  const targetLength = Math.max(MIN_ROWS, rows.length + 5);

  while (rows.length < targetLength) {
    rows.push({ ...EMPTY_ROW });
  }

  return rows;
}

function normalizeDraftRows(rows: JobEntryInput[]) {
  const cleaned = rows.map((row) => ({
    jobType: row.jobType ?? "",
    description: row.description ?? "",
    quantity:
      Number.isFinite(Number(row.quantity)) && Number(row.quantity) >= 0
        ? Number(row.quantity)
        : 1,
    amount:
      Number.isFinite(Number(row.amount)) && Number(row.amount) >= 0
        ? Number(row.amount)
        : 0,
    remarks: row.remarks ?? "",
  }));

  return buildSheetRows(cleaned);
}

function getInitialState(
  storageKeyBase: string,
  defaultValues: DailySheetFormProps["defaultValues"]
): FormState {
  const initial: FormState = {
    workDate: defaultValues.workDate,
    timeIn: defaultValues.timeIn ?? "",
    attendanceStatus: defaultValues.attendanceStatus ?? "PRESENT",
    notes: defaultValues.notes ?? "",
    jobEntries: buildSheetRows(defaultValues.jobEntries),
  };

  if (typeof window === "undefined") {
    return initial;
  }

  const draftStorageKey = `${storageKeyBase}:${defaultValues.workDate}`;
  const savedDraft = window.localStorage.getItem(draftStorageKey);

  if (!savedDraft) {
    return initial;
  }

  try {
    const parsed = JSON.parse(savedDraft) as DailySheetDraft;

    return {
      workDate: parsed.workDate || defaultValues.workDate,
      timeIn: parsed.timeIn || "",
      attendanceStatus: parsed.attendanceStatus || "PRESENT",
      notes: parsed.notes || "",
      jobEntries: normalizeDraftRows(parsed.jobEntries || []),
    };
  } catch {
    window.localStorage.removeItem(draftStorageKey);
    return initial;
  }
}

export function DailySheetForm({
  action,
  storageKeyBase,
  defaultValues,
  success,
  error,
}: DailySheetFormProps) {
  const [formState, setFormState] = useState<FormState>(() =>
    getInitialState(storageKeyBase, defaultValues)
  );

  const previousDateRef = useRef(formState.workDate);
  const banner = getBannerMessage(success, error);

  const draftStorageKey = `${storageKeyBase}:${formState.workDate}`;

  const isLate =
    formState.attendanceStatus === "PRESENT" && formState.timeIn >= "08:00";
  const lateDeduction = isLate ? 100 : 0;

  const dailyTotal = useMemo(() => {
    if (formState.attendanceStatus !== "PRESENT") return 0;

    return formState.jobEntries.reduce((sum, item) => {
      return sum + Number(item.amount || 0);
    }, 0);
  }, [formState.attendanceStatus, formState.jobEntries]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateJobEntry(
    index: number,
    field: keyof JobEntryInput,
    value: string
  ) {
    setFormState((prev) => ({
      ...prev,
      jobEntries: prev.jobEntries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]:
                field === "quantity" || field === "amount"
                  ? Number(value || 0)
                  : value,
            }
          : entry
      ),
    }));
  }

  function addMoreRows() {
    setFormState((prev) => ({
      ...prev,
      jobEntries: [
        ...prev.jobEntries,
        ...Array.from({ length: 10 }, () => ({ ...EMPTY_ROW })),
      ],
    }));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (success === "saved") {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [success, draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const previousDate = previousDateRef.current;
    if (previousDate !== formState.workDate) {
      const oldKey = `${storageKeyBase}:${previousDate}`;
      window.localStorage.setItem(
        oldKey,
        JSON.stringify({
          workDate: previousDate,
          timeIn: formState.timeIn,
          attendanceStatus: formState.attendanceStatus,
          notes: formState.notes,
          jobEntries: formState.jobEntries,
        })
      );

      previousDateRef.current = formState.workDate;
    }

    const draft: DailySheetDraft = {
      workDate: formState.workDate,
      timeIn: formState.timeIn,
      attendanceStatus: formState.attendanceStatus,
      notes: formState.notes,
      jobEntries: formState.jobEntries,
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draft));
  }, [draftStorageKey, formState, storageKeyBase]);

  return (
    <div className="space-y-6">
      {banner ? (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            banner.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {banner.message}
        </div>
      ) : null}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        Draft auto-save is on. If the page reloads accidentally, your unsaved input
        will be restored for this date.
      </div>

      <form action={action} className="space-y-6">
        <input
          type="hidden"
          name="jobEntriesJson"
          value={JSON.stringify(formState.jobEntries)}
        />

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900">Daily Sheet Details</h2>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="workDate"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Work Date
              </label>
              <input
                id="workDate"
                name="workDate"
                type="date"
                value={formState.workDate}
                onChange={(e) => updateField("workDate", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="attendanceStatus"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Attendance Status
              </label>
              <select
                id="attendanceStatus"
                name="attendanceStatus"
                value={formState.attendanceStatus}
                onChange={(e) =>
                  updateField(
                    "attendanceStatus",
                    e.target.value as "PRESENT" | "ABSENT" | "NO_RECORD"
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="NO_RECORD">No Record</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timeIn"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Time In
              </label>
              <input
                id="timeIn"
                name="timeIn"
                type="time"
                value={formState.timeIn}
                onChange={(e) => updateField("timeIn", e.target.value)}
                disabled={formState.attendanceStatus !== "PRESENT"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Notes
              </label>
              <input
                id="notes"
                name="notes"
                value={formState.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Delivery, supplies, errands, etc."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Job Entries Sheet</h2>
              <p className="text-sm text-slate-500 mt-1">
                Type directly into the sheet. Leave unused rows blank.
              </p>
            </div>

            <button
              type="button"
              onClick={addMoreRows}
              disabled={formState.attendanceStatus !== "PRESENT"}
              className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:bg-slate-100 disabled:text-slate-400"
            >
              Add 10 More Rows
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100">
                  <tr>
                    <th className="w-14 border-b border-r border-slate-200 px-3 py-3 text-center font-semibold text-slate-700">
                      #
                    </th>
                    <th className="min-w-[220px] border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                      Job Entries
                    </th>
                    <th className="min-w-[240px] border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                      Description
                    </th>
                    <th className="min-w-[120px] border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                      Quantity
                    </th>
                    <th className="min-w-[160px] border-b border-r border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                      Amount
                    </th>
                    <th className="min-w-[220px] border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-700">
                      Remarks
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {formState.jobEntries.map((entry, index) => (
                    <tr key={index} className="bg-white odd:bg-slate-50/40">
                      <td className="border-b border-r border-slate-200 px-3 py-2 text-center text-slate-500 align-middle">
                        {index + 1}
                      </td>

                      <td className="border-b border-r border-slate-200 p-0 bg-white">
                        <input
                          value={entry.jobType}
                          onChange={(e) =>
                            updateJobEntry(index, "jobType", e.target.value)
                          }
                          disabled={formState.attendanceStatus !== "PRESENT"}
                          placeholder=""
                          className="w-full bg-white px-3 py-3 text-slate-900 placeholder-slate-400 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      <td className="border-b border-r border-slate-200 p-0 bg-white">
                        <input
                          value={entry.description}
                          onChange={(e) =>
                            updateJobEntry(index, "description", e.target.value)
                          }
                          disabled={formState.attendanceStatus !== "PRESENT"}
                          placeholder=""
                          className="w-full bg-white px-3 py-3 text-slate-900 placeholder-slate-400 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      <td className="border-b border-r border-slate-200 p-0 bg-white">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={entry.quantity === 0 ? "" : entry.quantity}
                          onChange={(e) =>
                            updateJobEntry(index, "quantity", e.target.value)
                          }
                          disabled={formState.attendanceStatus !== "PRESENT"}
                          className="w-full bg-white px-3 py-3 text-slate-900 placeholder-slate-400 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>

                      <td className="border-b border-r border-slate-200 p-0 bg-white">
                        <div className="flex items-center bg-white">
                          <span className="px-3 text-slate-500">₱</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={entry.amount === 0 ? "" : entry.amount}
                            onChange={(e) =>
                              updateJobEntry(index, "amount", e.target.value)
                            }
                            disabled={formState.attendanceStatus !== "PRESENT"}
                            placeholder=""
                            className="w-full bg-white py-3 pr-3 text-slate-900 placeholder-slate-400 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>
                      </td>

                      <td className="border-b border-slate-200 p-0 bg-white">
                        <input
                          value={entry.remarks}
                          onChange={(e) =>
                            updateJobEntry(index, "remarks", e.target.value)
                          }
                          disabled={formState.attendanceStatus !== "PRESENT"}
                          placeholder=""
                          className="w-full bg-white px-3 py-3 text-slate-900 placeholder-slate-400 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="sticky bottom-0 bg-slate-100">
                  <tr>
                    <td
                      colSpan={4}
                      className="border-t border-r border-slate-200 px-3 py-3 text-right font-semibold text-slate-700"
                    >
                      Total
                    </td>
                    <td className="border-t border-r border-slate-200 px-3 py-3 font-bold text-slate-900">
                      ₱{dailyTotal.toFixed(2)}
                    </td>
                    <td className="border-t border-slate-200 px-3 py-3 text-slate-500">
                      {formState.attendanceStatus === "PRESENT"
                        ? "Only filled rows will be saved."
                        : "Job entries disabled unless attendance is Present."}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Late Status</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              {formState.attendanceStatus !== "PRESENT"
                ? "-"
                : isLate
                ? "Late"
                : "On Time"}
            </h3>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Late Deduction</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              ₱{lateDeduction.toFixed(2)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Daily Job Total</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              ₱{dailyTotal.toFixed(2)}
            </h3>
          </div>
        </div>

        <SubmitButton idleLabel="Save Daily Sheet" pendingLabel="Saving..." />
      </form>
    </div>
  );
}