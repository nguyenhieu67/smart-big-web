"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField } from "@/components/auth/form-field";
import { parseApiError } from "@/lib/api-error";
import { fieldErrors, loginSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";

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
          className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700"
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
        className="w-full rounded-lg bg-pink-600 py-2.5 text-xs font-semibold text-white transition hover:bg-pink-700 disabled:opacity-60"
      >
        {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="pt-1 text-center text-xs text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-pink-600 hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
