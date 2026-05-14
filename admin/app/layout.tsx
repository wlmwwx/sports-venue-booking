import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "运动场地预定 - 管理后台",
  description: "场馆管理与订单核销系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
