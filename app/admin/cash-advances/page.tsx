import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateOnly } from "@/lib/formatters";
import { deleteCashAdvanceAction } from "./actions";

type CashAdvancesPageProps = {
  searchParams?: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getBannerMessage(success?: string, error?: string) {
  if (success === "created") {
    return { type: "success" as const, message: "Cash advance added successfully." };
  }

  if (success === "updated") {
    return { type: "success" as const, message: "Cash advance updated successfully." };
  }

  if (success === "deleted") {
    return { type: "success" as const, message: "Cash advance deleted successfully." };
  }

  if (error === "invalid_input") {
    return { type: "error" as const, message: "Please check the form fields." };
  }

  if (error === "not_found") {
    return { type: "error" as const, message: "Cash advance record not found." };
  }

  return null;
}

export default async function CashAdvancesPage({
  searchParams,
}: CashAdvancesPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const banner = getBannerMessage(params?.success, params?.error);

  const cashAdvances = await prisma.cashAdvance.findMany({
    include: {
      employee: true,
    },
    orderBy: [
      { advanceDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  type CashAdvanceRow = (typeof cashAdvances)[number];

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
              <h1 className="text-2xl font-bold text-slate-900">Cash Advances</h1>
              <p className="text-slate-600 mt-1">
                Record employee cash advances that will be deducted from salary.
              </p>
            </div>

            <Link
              href="/admin/cash-advances/new"
              className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
            >
              Add Cash Advance
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
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Employee</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Note</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>

              <tbody>
                {cashAdvances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No cash advances recorded yet.
                    </td>
                  </tr>
                ) : (
                  cashAdvances.map((cashAdvance: CashAdvanceRow) => (
                    <tr key={cashAdvance.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateOnly(cashAdvance.advanceDate)}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium">
                        {cashAdvance.employee.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatCurrency(Number(cashAdvance.amount))}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {cashAdvance.note || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/admin/cash-advances/${cashAdvance.id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50 transition"
                          >
                            Edit
                          </Link>

                          <form action={deleteCashAdvanceAction}>
                            <input type="hidden" name="id" value={cashAdvance.id} />
                            <button
                              type="submit"
                              className="inline-flex rounded-lg border border-red-300 px-3 py-2 text-red-700 hover:bg-red-50 transition"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
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