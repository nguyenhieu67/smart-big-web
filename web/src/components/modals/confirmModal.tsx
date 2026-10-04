"use client";

import { Button } from "@/components/ui";

import { Modal } from "./modal";

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Xác nhận",
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-md">
      <p className="text-fg-body text-sm">{message}</p>
      {error && (
        <div
          role="alert"
          className="border-danger-line bg-danger-soft text-danger-fg rounded-lg border p-2.5 text-xs"
        >
          {error}
        </div>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Đang xử lý..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
