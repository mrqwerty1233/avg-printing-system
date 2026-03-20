import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters";

type EmployeesPageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getBannerMessage(success?: string, error?: string) {
  if (success === "created") {
    return {
      type: "success" as const,
      message: "Employee created successfully.",
    };
  }

  if (success === "updated") {
    return {
      type: "success" as const,
      message: "Employee updated successfully.",
    };
  }

  if (error === "not_found") {
    return {
      type: "error" as const,
      message: "Employee not found.",
    };
  }

  return null;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  await requireAdmin();

  const params = await searchParams;
  const banner = getBannerMessage(params?.success, params?.error);

  const employees = await prisma.employee.findMany({
    where: {
      user: {
        role: "STAFF",
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  type EmployeeRow = (typeof employees)[number];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex text-sm text-slate-600 hover:text-slate-900"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
              <p className="text-slate-600 mt-1">
                Manage staff accounts and employee details.
              </p>
            </div>

            <Link
              href="/admin/employees/new"
              className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
            >
              Add Employee
            </Link>
          </div>
        </div>

        {banner ? (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm border ${
              banner.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {banner.message}
          </div>
        ) : null}

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Full Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Employee Code
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Position
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Daily Salary
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Late Deduction
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No employees found yet.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee: EmployeeRow) => (
                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {employee.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {employee.user.email}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {employee.employeeCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {employee.position || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(Number(employee.dailySalary))}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(Number(employee.lateDeduction))}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            employee.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/employees/${employee.id}/edit`}
                          className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}