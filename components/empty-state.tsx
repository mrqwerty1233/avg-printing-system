type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-slate-600 mt-2">{description}</p>
    </div>
  );
}