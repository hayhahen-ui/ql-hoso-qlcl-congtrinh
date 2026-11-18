import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QLCL Pro — Quản lý Chất lượng & Hồ sơ Công trình (NĐ 207/2026/NĐ-CP)",
  description:
    "Nền tảng SaaS Quản lý Chất lượng, Nhật trình, Nghiệm thu 24h, Sổ cấp số bất biến và Xuất 30 Biểu mẫu A4 theo Nghị định 207/2026/NĐ-CP & Thông tư 32/2026/TT-BXD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
