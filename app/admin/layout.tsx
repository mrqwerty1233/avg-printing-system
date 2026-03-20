import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminNav />
      {children}
    </>
  );
}