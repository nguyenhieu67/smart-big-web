"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField } from "@/components/auth/formField";
import { parseApiError } from "@/lib/apiError";
import { registerSchema } from "@/schemas/authSchema";
import { authService } from "@/services/authService";
import { fieldErrors } from "@/utils/validate";

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const parsed = registerSchema.safeParse(
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});

    setSubmitting(true);
    try {
      await authService.register(parsed.data);
      router.replace("/dashboard");
    } catch (err) {
      const { message, code, fields } = parseApiError(err);
      setErrors(code === "EMAIL_EXISTS" ? { email: message } : fields);
      setFormError(code === "EMAIL_EXISTS" ? "" : message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {formError && (
        <div
          role="alert"
          className="border-danger-line bg-danger-soft text-danger-fg rounded-lg border p-2.5 text-xs"
        >
          {formError}
        </div>
      )}
      <FormField
        id="farmName"
        name="farmName"
        label="Tên trang trại"
        placeholder="Trại của tôi"
        error={errors.farmName}
      />
      <FormField
        id="email"
        name="email"
        type="email"
        label="Email *"
        autoComplete="email"
        error={errors.email}
      />
      <FormField
        id="password"
        name="password"
        type="password"
        label="Mật khẩu *"
        autoComplete="new-password"
        error={errors.password}
      />
      <FormField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Nhập lại mật khẩu *"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-hover w-full rounded-lg py-2.5 text-xs font-semibold text-white transition disabled:opacity-60"
      >
        {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>
      <p className="text-fg-muted pt-1 text-center text-xs">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
