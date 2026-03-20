type StatCardProps = {
  label: string;
  value: string | number;
  helperText?: string;
};

export function StatCard({ label, value, helperText }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="text-3xl font-bold text-slate-900 mt-2">{value}</h2>
      {helperText ? (
        <p className="text-xs text-slate-500 mt-2">{helperText}</p>
      ) : null}
    </div>
  );
}