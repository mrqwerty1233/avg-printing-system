import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CashAdvanceForm } from "@/components/cash-advance-form";
import { updateCashAdvanceAction } from "../../actions";

type EditCashAdvancePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function EditCashAdvancePage({
  params,
  searchParams,
}: EditCashAdvancePageProps) {
  await requireAdmin();

  const { id } = await params;
  const query = await searchParams;

  const cashAdvance = await prisma.cashAdvance.findUnique({
    where: {
      id,
    },
    include: {
      employee: true,
    },
  });

  if (!cashAdvance) {
    notFound();
  }

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
      fullName: "asc",
    },
  });

  type EmployeeOptionRow = (typeof employees)[number];

  const employeeOptions = employees.map((employee: EmployeeOptionRow) => ({
    id: employee.id,
    fullName: employee.fullName,
    email: employee.user.email,
  }));

  const boundUpdateAction = updateCashAdvanceAction.bind(null, cashAdvance.id);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/cash-advances"
            className="inline-flex text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Cash Advances
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mt-3">
            Edit Cash Advance
          </h1>
          <p className="text-slate-600 mt-1">
            Update cash advance details.
          </p>
        </div>

        {query?.error === "invalid_input" ? (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm border border-red-200 bg-red-50 text-red-700">
            Please check the form fields and try again.
          </div>
        ) : null}

        <CashAdvanceForm
          employees={employeeOptions}
          action={boundUpdateAction}
          submitLabel="Update Cash Advance"
          cancelHref="/admin/cash-advances"
          defaultValues={{
            employeeId: cashAdvance.employeeId,
            advanceDate: cashAdvance.advanceDate.toISOString().slice(0, 10),
            amount: Number(cashAdvance.amount),
            note: cashAdvance.note ?? "",
          }}
        />
      </div>
    </main>
  );
}