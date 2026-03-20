import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg border border-slate-200 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
        <p className="text-slate-600 mt-3">
          You are not allowed to access this page.
        </p>

        <Link
          href="/login"
          className="inline-flex mt-6 rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}