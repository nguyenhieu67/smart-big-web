"use client";

import { Fragment } from "react";

import { useAuth } from "@/providers/authProvider";
import type { Farm } from "@/types/auth";

// Chờ phiên đăng nhập, bắt buộc có trang trại đang chọn, và remount nội dung khi đổi trang trại
// (key) để dữ liệu/state của trại cũ không bị lẫn sang trại mới.
export function FarmGate({
  children,
}: {
  children: (farm: Farm) => React.ReactNode;
}) {
  const { activeFarm, loading } = useAuth();

  if (loading) return <p className="text-fg-muted text-xs">Đang tải...</p>;
  if (!activeFarm) {
    return (
      <p className="text-fg-muted text-xs">Bạn chưa thuộc trang trại nào.</p>
    );
  }
  return <Fragment key={activeFarm.id}>{children(activeFarm)}</Fragment>;
}
