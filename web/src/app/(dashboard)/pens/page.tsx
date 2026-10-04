"use client";

import {
  EditIcon,
  PlusIcon,
  TrashIcon,
  WarehouseIcon,
} from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, PenFormModal } from "@/components/modals";
import { Button } from "@/components/ui";
import { useAppToast, useFetchData, useTableActions } from "@/hooks";
import type { PenPayload } from "@/schemas/penSchema";
import { penService } from "@/services/penService";
import type { Farm } from "@/types/auth";
import type { Pen } from "@/types/pen";

const EMPTY_PENS: Pen[] = [];

// Tạm hardcode: API chưa có các trường này (nhiệt độ, vệ sinh... sẽ lấy từ camera/cảm biến sau)
const PEN_PLACEHOLDER = {
  temperature: "27°C",
  hygiene: "Sạch sẽ",
  condition: "Tốt",
};

export default function PensPage() {
  return <FarmGate>{(farm) => <PensContent farm={farm} />}</FarmGate>;
}

function PensContent({ farm }: { farm: Farm }) {
  const canWrite = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDelete = farm.role === "OWNER";

  const toast = useAppToast();
  const { data, loading, error, refetch } = useFetchData(() =>
    penService.list(),
  );
  const pens = data ?? EMPTY_PENS;

  const actions = useTableActions<Pen>({
    remove: (pen) => penService.remove(pen.id),
    deletedMessage: (pen) => `Đã xóa ${pen.name}`,
    onDeleted: refetch,
  });

  async function handleSubmit(payload: PenPayload) {
    if (actions.selectedItem) {
      await penService.update(actions.selectedItem.id, payload);
      toast.success(`Đã cập nhật ${payload.name}`);
    } else {
      await penService.create(payload);
      toast.success(`Đã thêm ${payload.name}`);
    }
    actions.closeForm();
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<WarehouseIcon size="sm" className="text-info" />}
        title="9. Quản Lý Chuồng Trại"
        description="Các dãy chuồng của trại: khu nái mang thai, khu đẻ nuôi con, khu cai sữa, khu nuôi thịt."
        action={
          canWrite && (
            <Button
              onClick={actions.openCreate}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Thêm Chuồng
            </Button>
          )
        }
      />

      {loading ? (
        <p className="text-fg-muted p-6 text-center text-sm">Đang tải...</p>
      ) : error ? (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-danger text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Thử lại
          </Button>
        </div>
      ) : pens.length === 0 ? (
        <div className="card text-fg-muted p-8 text-center text-sm">
          Chưa có chuồng nào. Hãy thêm chuồng đầu tiên.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pens.map((pen) => {
            const count = pen._count?.sows ?? 0;
            const percent =
              pen.capacity > 0
                ? Math.min(100, Math.round((count / pen.capacity) * 100))
                : 0;
            const isFull = pen.capacity > 0 && count >= pen.capacity;

            return (
              <div key={pen.id} className="card space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-fg flex min-w-0 items-center text-base font-bold">
                    <WarehouseIcon
                      size="sm"
                      className="text-info mr-2 shrink-0"
                    />
                    <span className="truncate">{pen.name}</span>
                  </h3>
                  {pen.subname && (
                    <span className="bg-info-soft text-info-fg shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
                      {pen.subname}
                    </span>
                  )}
                </div>

                {pen.description && (
                  <p className="text-fg-muted line-clamp-2 text-xs">
                    {pen.description}
                  </p>
                )}

                <div className="bg-surface-muted grid grid-cols-2 gap-2 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-fg-muted">Số lượng:</span>{" "}
                    <strong className="text-fg">
                      {count}/{pen.capacity} con
                    </strong>
                  </div>
                  <div>
                    <span className="text-fg-muted">Nhiệt độ:</span>{" "}
                    <strong className="text-fg">
                      {PEN_PLACEHOLDER.temperature}
                    </strong>
                  </div>
                  <div>
                    <span className="text-fg-muted">Vệ sinh:</span>{" "}
                    <span className="text-success font-medium">
                      {PEN_PLACEHOLDER.hygiene}
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-muted">Tình trạng:</span>{" "}
                    <span className="text-fg-body">
                      {PEN_PLACEHOLDER.condition}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-hover h-2 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${isFull ? "bg-danger" : "bg-info"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {(canWrite || canDelete) && (
                  <div className="flex items-center justify-end gap-1 pt-1">
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => actions.openEdit(pen)}
                        title="Chỉnh sửa"
                        className="text-fg-muted hover:bg-surface-hover hover:text-info cursor-pointer rounded p-2 transition sm:p-1.5"
                      >
                        <EditIcon />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => actions.askDelete(pen)}
                        title="Xóa"
                        className="text-fg-muted hover:bg-surface-hover hover:text-danger cursor-pointer rounded p-2 transition sm:p-1.5"
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actions.isFormOpen && (
        <PenFormModal
          key={actions.selectedItem?.id ?? "new"}
          pen={actions.selectedItem}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa chuồng"
          message={
            <>
              Bạn chắc chắn muốn xóa{" "}
              <strong>{actions.deleteTarget.name}</strong>? Thao tác này không
              thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={actions.deleteLoading}
          onConfirm={actions.confirmDelete}
          onClose={actions.cancelDelete}
        />
      )}
    </div>
  );
}
