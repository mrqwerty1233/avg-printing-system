import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { EmployeeForm } from "@/components/employee-form";
import { updateEmployeeAction } from "../../actions";

type EditEmployeePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function EditEmployeePage({
  params,
  searchParams,
}: EditEmployeePageProps) {
  await requireAdmin();

  const { id } = await params;
  const query = await searchParams;

  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });

  if (!employee) {
    notFound();
  }

  const boundUpdateAction = updateEmployeeAction.bind(null, employee.id);

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
          <h1 className="text-2xl font-bold text-slate-900">Edit Employee</h1>
          <p className="text-slate-600 mt-1">
            Update employee account and profile details.
          </p>
        </div>

        <EmployeeForm
          mode="edit"
          action={boundUpdateAction}
          error={query?.error}
          defaultValues={{
            fullName: employee.fullName,
            email: employee.user.email,
            employeeCode: employee.employeeCode,
            position: employee.position,
            dailySalary: Number(employee.dailySalary),
            lateDeduction: Number(employee.lateDeduction),
            isActive: employee.isActive,
          }}
        />
      </div>
    </main>
  );
}