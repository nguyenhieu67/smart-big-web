import type { z } from "zod";

// zod issues -> { field: message } (chỉ lấy lỗi đầu tiên của mỗi field)
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
