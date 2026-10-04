"use client";

import { useState } from "react";
import type { z } from "zod";

import { parseApiError } from "@/lib/apiError";
import { fieldErrors } from "@/utils/validate";

interface UseFormSubmitOptions<TOut> {
  schema: z.ZodType<TOut>;
  values: unknown;
  onSubmit: (payload: TOut) => Promise<void>;
  // Trả về lỗi theo field để thay cho thông báo chung (vd. 409 trùng mã -> lỗi ở ô mã)
  mapError?: (err: unknown) => Record<string, string> | undefined;
}

// Kiểm tra form bằng zod -> gọi onSubmit -> gắn lỗi từ API (422 theo field) vào đúng ô nhập
export function useFormSubmit<TOut>({
  schema,
  values,
  onSubmit,
  mapError,
}: UseFormSubmitOptions<TOut>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const parsed = schema.safeParse(values);
    if (!parsed.success) return setErrors(fieldErrors(parsed.error));
    setErrors({});

    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      const mapped = mapError?.(err);
      if (mapped) {
        setErrors(mapped);
      } else {
        const { message, fields } = parseApiError(err);
        setErrors(fields);
        setFormError(message);
      }
      setSubmitting(false);
    }
  }

  return { errors, formError, submitting, handleSubmit };
}
