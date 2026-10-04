import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Đăng nhập - SmartPig" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng trở lại, đăng nhập để quản lý trang trại."
    >
      <LoginForm />
    </AuthShell>
  );
}
