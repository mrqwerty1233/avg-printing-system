type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main className={`min-h-screen bg-slate-100 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}