"use client";

import { useState } from "react";

export type FormChangeEvent =
  | React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  | { target: { name?: string; value: unknown } };

interface UseFormOptions<T> {
  numberFields?: (keyof T | string)[];
  customHandlers?: Partial<
    Record<keyof T | string, (value: unknown, prev: T) => Partial<T>>
  >;
}

export function useForm<T extends Record<string, unknown>>(
  initialState: T,
  options: UseFormOptions<T> = {},
) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = (e: FormChangeEvent) => {
    const { name, value } = e.target;
    if (!name) return;

    const customHandler = options.customHandlers?.[name];
    if (customHandler) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...customHandler(value, prev),
      }));
      return;
    }

    const isNumberField = options.numberFields?.includes(name);
    setFormData((prev) => ({
      ...prev,
      [name]: isNumberField ? Number(value) || 0 : value,
    }));
  };

  const resetForm = () => setFormData(initialState);

  return { formData, setFormData, handleChange, resetForm };
}
