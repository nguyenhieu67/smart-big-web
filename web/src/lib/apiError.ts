import axios from "axios";

// Chuẩn hóa lỗi BE: { error: { message, code, info: { details: [{field, message}] } } }
export interface ParsedApiError {
  message: string;
  code?: string;
  fields: Record<string, string>;
}

export function parseApiError(err: unknown): ParsedApiError {
  if (axios.isAxiosError(err)) {
    if (!err.response)
      return { message: "Không kết nối được máy chủ", fields: {} };

    const body = err.response.data;
    const e = body?.error ?? body;
    const fields: Record<string, string> = {};
    for (const d of e?.info?.details ?? []) fields[d.field] ??= d.message;

    return { message: e?.message ?? "Có lỗi xảy ra", code: e?.code, fields };
  }
  return { message: "Có lỗi xảy ra", fields: {} };
}
