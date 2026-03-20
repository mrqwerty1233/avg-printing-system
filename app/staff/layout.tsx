import { StaffNav } from "@/components/staff-nav";

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StaffNav />
      {children}
    </>
  );
}