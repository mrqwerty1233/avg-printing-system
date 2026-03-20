import { SubmitButton } from "./submit-button";

type EmployeeFormProps = {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: {
    fullName?: string;
    email?: string;
    employeeCode?: string | null;
    position?: string | null;
    dailySalary?: number | string;
    lateDeduction?: number | string;
    isActive?: boolean;
  };
  error?: string;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "invalid_input":
      return "Please check the form fields and try again.";
    case "password_required":
      return "Password is required when creating a new employee.";
    case "email_exists":
      return "That email is already being used by another account.";
    case "employee_code_exists":
      return "That employee code already exists.";
    default:
      return "";
  }
}

export function EmployeeForm({
  mode,
  action,
  defaultValues,
  error,
}: EmployeeFormProps) {
  const errorMessage = getErrorMessage(error);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <form action={action} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              defaultValue={defaultValues?.fullName ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={defaultValues?.email ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="employee@avg.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              {mode === "create" ? "Password" : "New Password (optional)"}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder={
                mode === "create"
                  ? "Enter password"
                  : "Leave blank to keep current password"
              }
            />
          </div>

          <div>
            <label
              htmlFor="employeeCode"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Employee Code
            </label>
            <input
              id="employeeCode"
              name="employeeCode"
              defaultValue={defaultValues?.employeeCode ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Optional employee code"
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Position
            </label>
            <input
              id="position"
              name="position"
              defaultValue={defaultValues?.position ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="Staff position"
            />
          </div>

          <div>
            <label
              htmlFor="dailySalary"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Daily Salary
            </label>
            <input
              id="dailySalary"
              name="dailySalary"
              type="number"
              step="0.01"
              defaultValue={defaultValues?.dailySalary ?? 450}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="lateDeduction"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Late Deduction
            </label>
            <input
              id="lateDeduction"
              name="lateDeduction"
              type="number"
              step="0.01"
              defaultValue={defaultValues?.lateDeduction ?? 100}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div>
            <label
              htmlFor="isActive"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Status
            </label>
            <select
              id="isActive"
              name="isActive"
              defaultValue={defaultValues?.isActive === false ? "false" : "true"}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <SubmitButton
            idleLabel={mode === "create" ? "Create Employee" : "Update Employee"}
            pendingLabel={mode === "create" ? "Creating..." : "Updating..."}
          />
        </div>
      </form>
    </div>
  );
}