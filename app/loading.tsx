export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-6 py-5 text-center">
        <div className="h-10 w-10 mx-auto rounded-full border-4 border-slate-300 border-t-slate-900 animate-spin" />
        <p className="text-slate-700 mt-4 font-medium">Loading...</p>
      </div>
    </main>
  );
}