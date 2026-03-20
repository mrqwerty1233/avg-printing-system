import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AVG Printing Shop System",
  description: "Employee Job, Attendance, and Salary Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}