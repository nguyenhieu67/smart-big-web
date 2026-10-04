"use client";

import { useEffect } from "react";

import { CloseIcon } from "@/components/icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="bg-overlay fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-surface border-line shadow-pop max-h-full w-full space-y-4 overflow-y-auto rounded-2xl border p-4 sm:p-6 ${maxWidth}`}
      >
        <div className="border-line-soft flex items-center justify-between border-b pb-3">
          <h3 className="text-fg text-base font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-fg-subtle hover:text-fg-muted cursor-pointer"
          >
            <CloseIcon size="sm" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
