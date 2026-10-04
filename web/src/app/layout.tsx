import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/providers/toastProvider";

import "./globals.css";

const inter = Inter({ subsets: ["vietnamese", "latin"] });

export const metadata: Metadata = {
  title: "SmartPig - Quản lý chăn nuôi heo",
  description: "Hệ thống quản lý chăn nuôi heo nái & heo thịt toàn diện",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi">
      <body className={`${inter.className} text-fg`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
