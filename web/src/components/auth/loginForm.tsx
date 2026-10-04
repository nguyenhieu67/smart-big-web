"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField } from "@/components/auth/formField";
import { parseApiError } from "@/lib/apiError";
import { loginSchema } from "@/schemas/authSchema";
import { authService } from "@/services/authService";
import { fieldErrors } from "@/utils/validate";

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const parsed = loginSchema.safeParse(
      Object.fromEntries(new FormData(e.currentTarget)),
    );
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});

    setSubmitting(true);
    try {
      await authService.login(parsed.data);
      router.replace("/dashboard");
    } catch (err) {
      const { message, fields } = parseApiError(err);
      setErrors(fields);
      setFormError(message);
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
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        error={errors.email}
      />
      <FormField
        id="password"
        name="password"
        type="password"
        label="Mật khẩu"
        autoComplete="current-password"
        error={errors.password}
      />
      <button
        type="submit"
        disabled={submitting}
        className="bg-primary hover:bg-primary-hover w-full rounded-lg py-2.5 text-xs font-semibold text-white transition disabled:opacity-60"
      >
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="text-fg-muted pt-1 text-center text-xs">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
