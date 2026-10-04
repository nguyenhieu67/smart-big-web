"use client";

import { useCallback, useState } from "react";

import { parseApiError } from "@/lib/apiError";

import { useAppToast } from "./useAppToast";

interface UseTableActionsOptions<T> {
  remove: (item: T) => Promise<void>;
  deletedMessage: (item: T) => string;
  // gọi sau khi xóa thành công (thường là refetch danh sách)
  onDeleted: () => void;
}

// Gom state của modal thêm/sửa và modal xác nhận xóa cho các trang danh sách (CRUD)
export function useTableActions<T extends { id: number | string }>({
  remove,
  deletedMessage,
  onDeleted,
}: UseTableActionsOptions<T>) {
  const toast = useAppToast();

  // Thêm / sửa: selectedItem = null nghĩa là đang thêm mới
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setSelectedItem(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedItem(null);
  }, []);

  // Xóa
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await remove(deleteTarget);
      toast.success(deletedMessage(deleteTarget));
      setDeleteTarget(null);
      onDeleted();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    isFormOpen,
    selectedItem,
    openCreate,
    openEdit,
    closeForm,
    deleteTarget,
    deleteLoading,
    askDelete: setDeleteTarget,
    cancelDelete,
    confirmDelete,
  };
}
