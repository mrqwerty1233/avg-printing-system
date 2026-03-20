"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg border border-red-200 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="text-slate-600 mt-3">
          An unexpected error happened while loading this page.
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={reset}
            className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}