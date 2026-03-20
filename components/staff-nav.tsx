import Link from "next/link";

const links = [
  { href: "/staff/dashboard", label: "Dashboard" },
  { href: "/staff/daily-sheet", label: "Daily Sheet" },
  { href: "/staff/history", label: "History" },
  { href: "/staff/monthly-summary", label: "Monthly Summary" },
];

export function StaffNav() {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}