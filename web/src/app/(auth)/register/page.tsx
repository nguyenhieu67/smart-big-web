import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/authShell";
import { RegisterForm } from "@/components/auth/registerForm";

export const metadata: Metadata = { title: "Đăng ký - SmartPig" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Đăng ký và tạo trang trại đầu tiên của bạn."
    >
      <RegisterForm />
    </AuthShell>
  );
}
