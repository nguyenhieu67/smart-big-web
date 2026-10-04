"use client";

import { ToastContainer } from "react-toastify";

// Gắn một lần ở root layout; gọi toast qua hook useAppToast ở bất kỳ đâu
export function ToastProvider() {
  return <ToastContainer position="top-right" autoClose={3000} newestOnTop />;
}
