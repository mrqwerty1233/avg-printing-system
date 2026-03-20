"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 font-medium hover:bg-slate-800 transition"
    >
      Print Report
    </button>
  );
}