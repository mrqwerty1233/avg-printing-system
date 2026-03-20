"use client";

import { SubmitButton } from "./submit-button";

type EmployeeOption = {
  id: string;
  fullName: string;
  email: string;
};

type CashAdvanceFormProps = {
  employees: EmployeeOption[];
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    employeeId?: string;
    advanceDate?: string;
    amount?: number;
    note?: string;
  };
  submitLabel?: string;
  cancelHref: string;
};

export function CashAdvanceForm({
  employees,
  action,
  defaultValues,
  submitLabel = "Save Cash Advance",
  cancelHref,
}: CashAdvanceFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Cash Advance Details
        </h2>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="employeeId"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Employee
            </label>
            <select
              id="employeeId"
              name="employeeId"
              required
              defaultValue={defaultValues?.employeeId ?? ""}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} — {employee.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="advanceDate"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Advance Date
            </label>
            <input
              id="advanceDate"
              name="advanceDate"
              type="date"
              required
              defaultValue={defaultValues?.advanceDate ?? ""}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              defaultValue={defaultValues?.amount ?? ""}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="note"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Note
            </label>
            <input
              id="note"
              name="note"
              type="text"
              defaultValue={defaultValues?.note ?? ""}
              placeholder="Optional note"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton idleLabel={submitLabel} pendingLabel="Saving..." />

        <a
          href={cancelHref}
          className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}