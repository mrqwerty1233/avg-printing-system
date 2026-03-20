import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { EmployeeForm } from "@/components/employee-form";
import { createEmployeeAction } from "../actions";

type NewEmployeePageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewEmployeePage({
  searchParams,
}: NewEmployeePageProps) {
  await requireAdmin();

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/employees"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Employees
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
          <p className="text-slate-600 mt-1">
            Create a new staff account and employee profile.
          </p>
        </div>

        <EmployeeForm
          mode="create"
          action={createEmployeeAction}
          error={params?.error}
          defaultValues={{
            dailySalary: 450,
            lateDeduction: 100,
            isActive: true,
          }}
        />
      </div>
    </main>
  );
}