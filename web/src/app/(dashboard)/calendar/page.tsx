"use client";

import { useMemo, useState } from "react";

import {
  CalenDarDaysIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";
import { CheckboxField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, ReminderFormModal } from "@/components/modals";
import { Button } from "@/components/ui";
import { REMINDER_TYPE_OPTIONS } from "@/constants/reminder";
import { useAppToast, useFetchData, useTableActions } from "@/hooks";
import { parseApiError } from "@/lib/apiError";
import type { ReminderPayload } from "@/schemas/reminderSchema";
import { healthLogService } from "@/services/healthLogService";
import { matingService } from "@/services/matingService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { reminderService } from "@/services/reminderService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { HealthLog } from "@/types/healthLog";
import type { Mating } from "@/types/mating";
import type { PigletBatch } from "@/types/piglet";
import type { Reminder } from "@/types/reminder";
import type { Sow } from "@/types/sow";
import {
  buildAutoEvents,
  daysUntil,
  groupEvents,
  type CalendarEvent,
} from "@/utils/calendar";
import { formatDate, toInputDate } from "@/utils/format";

const EMPTY = {
  reminders: [] as Reminder[],
  sows: [] as Sow[],
  matings: [] as Mating[],
  batches: [] as PigletBatch[],
  healthLogs: [] as HealthLog[],
};

const GROUP_TONE: Record<string, string> = {
  overdue: "text-danger",
  today: "text-warning-fg",
  week: "text-indigo-fg",
  later: "text-fg-muted",
};

function relativeLabel(date: string) {
  const days = daysUntil(date);
  if (days < 0) return `Quá ${-days} ngày`;
  if (days === 0) return "Hôm nay";
  return `Còn ${days} ngày`;
}

export default function CalendarPage() {
  return <FarmGate>{(farm) => <CalendarContent farm={farm} />}</FarmGate>;
}

function CalendarContent({ farm }: { farm: Farm }) {
  // Nhắc việc: ai cũng thêm và sửa, OWNER/MANAGER xóa
  const canDelete = farm.role === "OWNER" || farm.role === "MANAGER";

  const toast = useAppToast();
  const [showDone, setShowDone] = useState(false);

  const { data, loading, error, refetch } = useFetchData(async () => {
    const [reminders, sows, matings, batches, healthLogs] = await Promise.all([
      reminderService.list(),
      sowService.list(),
      matingService.list(),
      pigletBatchService.list(),
      healthLogService.list(),
    ]);
    return { reminders, sows, matings, batches, healthLogs };
  });
  const source = data ?? EMPTY;

  const actions = useTableActions<Reminder>({
    remove: (r) => reminderService.remove(r.id),
    deletedMessage: () => "Đã xóa nhắc việc",
    onDeleted: refetch,
  });

  // Việc tự sinh từ dữ liệu trại + nhắc việc nhập tay (ẩn việc đã xong trừ khi bật xem)
  const events = useMemo<CalendarEvent[]>(() => {
    const auto = buildAutoEvents(source);
    const manual: CalendarEvent[] = source.reminders
      .filter((r) => showDone || !r.is_done)
      .map((r) => ({
        key: `reminder-${r.id}`,
        type: r.type,
        title: r.title,
        target: r.sow?.code ?? r.pigletBatch?.code ?? "",
        date: toInputDate(r.due_date),
        reminder: r,
      }));
    return [...auto, ...manual];
  }, [source, showDone]);

  const groups = useMemo(() => groupEvents(events), [events]);
  const overdueCount =
    groups.find((g) => g.id === "overdue")?.events.length ?? 0;
  const soonCount = events.filter((e) => {
    const days = daysUntil(e.date);
    return days >= 0 && days <= 7 && !e.reminder?.is_done;
  }).length;

  async function handleSubmit(payload: ReminderPayload) {
    if (actions.selectedItem) {
      await reminderService.update(actions.selectedItem.id, payload);
      toast.success("Đã cập nhật nhắc việc");
    } else {
      await reminderService.create(payload);
      toast.success("Đã thêm nhắc việc");
    }
    actions.closeForm();
    refetch();
  }

  async function toggleDone(reminder: Reminder) {
    try {
      await reminderService.setDone(reminder.id, !reminder.is_done);
      toast.success(reminder.is_done ? "Đã mở lại việc" : "Đã hoàn thành việc");
      refetch();
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalenDarDaysIcon size="sm" className="text-info" />}
        title="14. Lịch Nhắc Việc & Cảnh Báo Sắp Tới"
        description="Lịch phối, dự kiến đẻ, tiêm vaccine, cai sữa và các việc bạn tự thêm."
        action={
          <Button
            onClick={actions.openCreate}
            disabled={loading || !!error}
            leftIcon={<PlusIcon size="xs" />}
            className="rounded-xl text-xs font-semibold"
          >
            Thêm Nhắc Việc
          </Button>
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
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card space-y-4 p-5 lg:col-span-2">
            <div className="border-line-soft flex flex-col justify-between gap-3 border-b pb-3 sm:flex-row sm:items-center">
              <h3 className="text-fg text-sm font-bold">
                Danh sách công việc
                <span className="text-fg-muted ml-2 text-xs font-normal">
                  {overdueCount > 0 && (
                    <span className="text-danger font-semibold">
                      {overdueCount} quá hạn ·{" "}
                    </span>
                  )}
                  {soonCount} việc trong 7 ngày tới
                </span>
              </h3>
              <CheckboxField
                id="show-done"
                checked={showDone}
                onChange={(e) => setShowDone(e.target.checked)}
              >
                Hiện việc đã hoàn thành
              </CheckboxField>
            </div>

            {groups.length === 0 ? (
              <p className="text-fg-muted p-6 text-center text-sm">
                Không có công việc nào cần nhắc.
              </p>
            ) : (
              groups.map((group) => (
                <section key={group.id} className="space-y-2">
                  <h4
                    className={`text-xs font-bold tracking-wider uppercase ${GROUP_TONE[group.id]}`}
                  >
                    {group.label} ({group.events.length})
                  </h4>
                  {group.events.map((event) => {
                    const option = REMINDER_TYPE_OPTIONS.find(
                      (o) => o.value === event.type,
                    );
                    const Icon = option?.icon ?? CalenDarDaysIcon;
                    const done = event.reminder?.is_done ?? false;
                    return (
                      <div
                        key={event.key}
                        className="bg-surface-muted border-line flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`shrink-0 rounded-lg p-2.5 ${option?.soft ?? ""}`}
                          >
                            <Icon size="sm" />
                          </div>
                          <div className="min-w-0">
                            <h5
                              className={`text-fg text-xs font-bold ${done ? "line-through opacity-60" : ""}`}
                            >
                              {event.title}
                            </h5>
                            <p className="text-fg-muted text-[11px]">
                              {option?.label}
                              {event.target && (
                                <>
                                  {" · "}
                                  <strong>{event.target}</strong>
                                </>
                              )}
                              {!event.reminder && (
                                <span className="badge badge-info ml-2">
                                  Tự động
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                          <div className="text-right">
                            <span className="bg-surface border-line text-fg-body block rounded-lg border px-3 py-1 text-xs font-bold">
                              {formatDate(event.date)}
                            </span>
                            {!done && (
                              <span
                                className={`mt-0.5 block text-[11px] ${GROUP_TONE[group.id]}`}
                              >
                                {relativeLabel(event.date)}
                              </span>
                            )}
                          </div>

                          {event.reminder && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant={done ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => toggleDone(event.reminder!)}
                              >
                                {done ? "Mở lại" : "Hoàn thành"}
                              </Button>
                              <button
                                type="button"
                                onClick={() =>
                                  actions.openEdit(event.reminder!)
                                }
                                title="Chỉnh sửa"
                                className="text-fg-muted hover:bg-surface-hover hover:text-info cursor-pointer rounded p-2 transition sm:p-1.5"
                              >
                                <EditIcon />
                              </button>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    actions.askDelete(event.reminder!)
                                  }
                                  title="Xóa"
                                  className="text-fg-muted hover:bg-surface-hover hover:text-danger cursor-pointer rounded p-2 transition sm:p-1.5"
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </section>
              ))
            )}
          </div>

          <div className="card h-fit space-y-4 p-5">
            <h3 className="text-fg border-line-soft border-b pb-2 text-sm font-bold">
              Chú giải ký hiệu lịch
            </h3>
            <ul className="text-fg-body space-y-2.5 text-xs">
              {REMINDER_TYPE_OPTIONS.map((o) => (
                <li key={o.value} className="flex items-center gap-2">
                  <span className={`h-3 w-3 shrink-0 rounded-full ${o.dot}`} />
                  {o.legend}
                </li>
              ))}
            </ul>
            <p className="text-fg-muted text-[11px] leading-relaxed">
              Việc &quot;Tự động&quot; được tính từ dữ liệu phối giống, sinh
              sản, nhật ký sức khỏe và đàn heo con (việc quá hạn quá 14 ngày sẽ
              không còn hiện). Bạn có thể thêm việc riêng bằng nút &quot;Thêm
              Nhắc Việc&quot;.
            </p>
          </div>
        </div>
      )}

      {actions.isFormOpen && (
        <ReminderFormModal
          key={actions.selectedItem?.id ?? "new"}
          reminder={actions.selectedItem}
          sows={source.sows}
          batches={source.batches}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa nhắc việc"
          message={
            <>
              Bạn chắc chắn muốn xóa nhắc việc{" "}
              <strong>{actions.deleteTarget.title}</strong>? Thao tác này không
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
