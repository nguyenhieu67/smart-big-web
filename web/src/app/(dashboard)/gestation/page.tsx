"use client";

import { useMemo } from "react";

import { BabyCarriageIcon, HeartPulseIcon } from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { GESTATION_DAYS } from "@/constants/mating";
import { useFetchData } from "@/hooks";
import { feedLogService } from "@/services/feedLogService";
import { healthLogService } from "@/services/healthLogService";
import { matingService } from "@/services/matingService";
import { penService } from "@/services/penService";
import { sowService } from "@/services/sowService";
import type { FeedLog } from "@/types/feed";
import type { HealthLog } from "@/types/healthLog";
import type { Mating } from "@/types/mating";
import type { Pen } from "@/types/pen";
import type { Sow } from "@/types/sow";
import { formatDate, toInputDate, toLocalDateString } from "@/utils/format";

const EMPTY_SOWS: Sow[] = [];
const EMPTY_MATINGS: Mating[] = [];
const EMPTY_PENS: Pen[] = [];
const EMPTY_HEALTH: HealthLog[] = [];
const EMPTY_FEEDS: FeedLog[] = [];

const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_DAYS = 7; // "sắp đẻ" khi còn không quá 7 ngày

interface PregnantSow {
  sow: Sow;
  mating: Mating | null;
  penName: string;
  daysPregnant: number | null;
  daysLeft: number | null;
  vaccine: HealthLog | null; // lần tiêm vaccine gần nhất trong thai kỳ này
  feed: FeedLog | null; // lần cho ăn gần nhất ở chuồng của nái
}

const latestBy = <T extends { id: number; log_date: string }>(items: T[]) =>
  items.sort(
    (a, b) => b.log_date.localeCompare(a.log_date) || b.id - a.id,
  )[0] ?? null;

export default function GestationPage() {
  return <FarmGate>{() => <GestationContent />}</FarmGate>;
}

function GestationContent() {
  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      sowService.list(),
      matingService.list(),
      penService.list(),
      healthLogService.list(),
      feedLogService.list(),
    ]),
  );
  const [sows, matings, pens, healthLogs, feedLogs] = data ?? [
    EMPTY_SOWS,
    EMPTY_MATINGS,
    EMPTY_PENS,
    EMPTY_HEALTH,
    EMPTY_FEEDS,
  ];

  // Thai kỳ không có API riêng: lấy nái đang mang thai + lần phối gần nhất chưa bị "không đậu"
  const pregnant = useMemo<PregnantSow[]>(() => {
    const today = Date.parse(toLocalDateString());
    const penNames = new Map(pens.map((p) => [p.id, p.name]));

    return sows
      .filter((s) => s.status === "PREGNANT")
      .map((sow) => {
        const mating =
          matings
            .filter((m) => m.sow_id === sow.id && m.result !== "FAILED")
            .sort((a, b) => b.mating_date.localeCompare(a.mating_date))[0] ??
          null;

        const daysPregnant = mating
          ? Math.round(
              (today - Date.parse(toInputDate(mating.mating_date))) / DAY_MS,
            )
          : null;
        const daysLeft = mating
          ? Math.round(
              (Date.parse(toInputDate(mating.expected_farrow_date)) - today) /
                DAY_MS,
            )
          : null;

        // Vaccine: chỉ tính các lần tiêm từ ngày phối (thai kỳ hiện tại); chưa có lần phối thì lấy mọi lần
        const vaccine = latestBy(
          healthLogs.filter(
            (h) =>
              h.sow_id === sow.id &&
              h.category === "VACCINATION" &&
              (!mating ||
                toInputDate(h.log_date) >= toInputDate(mating.mating_date)),
          ),
        );
        const feed = latestBy(feedLogs.filter((f) => f.pen_id === sow.pen_id));

        return {
          sow,
          mating,
          penName: penNames.get(sow.pen_id) ?? "—",
          daysPregnant,
          daysLeft,
          vaccine,
          feed,
        };
      })
      .sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));
  }, [sows, matings, pens, healthLogs, feedLogs]);

  const soonCount = pregnant.filter(
    (p) => p.daysLeft != null && p.daysLeft <= SOON_DAYS,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<BabyCarriageIcon size="sm" className="text-indigo" />}
        title="3. Theo Dõi Mang Thai & Thai Kỳ"
        description="Tiến độ mang thai của các nái, ngày phối và ngày dự kiến sinh."
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
        <>
          <div className="grid grid-cols-2 gap-4 sm:max-w-md">
            <div className="card p-4">
              <p className="text-fg-muted text-xs">Nái đang mang thai</p>
              <p className="text-indigo mt-1 text-2xl font-black">
                {pregnant.length}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-fg-muted text-xs">
                Sắp đẻ (≤ {SOON_DAYS} ngày)
              </p>
              <p className="text-danger mt-1 text-2xl font-black">
                {soonCount}
              </p>
            </div>
          </div>

          {pregnant.length === 0 ? (
            <div className="card text-fg-muted p-8 text-center text-sm">
              Không có heo nái nào đang trong thai kỳ.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {pregnant.map(
                ({
                  sow,
                  mating,
                  penName,
                  daysPregnant,
                  daysLeft,
                  vaccine,
                  feed,
                }) => {
                  const percent =
                    daysPregnant != null
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            Math.round((daysPregnant / GESTATION_DAYS) * 100),
                          ),
                        )
                      : 0;
                  const soon = daysLeft != null && daysLeft <= SOON_DAYS;

                  return (
                    <div key={sow.id} className="card space-y-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-primary text-xs font-bold uppercase">
                            Mã nái: {sow.code}
                          </span>
                          <h4 className="text-fg truncate text-base font-bold">
                            {sow.breed} (Lứa {sow.parity_count + 1})
                          </h4>
                        </div>
                        {daysPregnant != null && (
                          <span className="badge badge-indigo shrink-0">
                            Ngày thai: {daysPregnant}/{GESTATION_DAYS}
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="text-fg-muted mb-1 flex justify-between text-[11px]">
                          <span>Tiến trình mang thai</span>
                          <span
                            className={`font-bold ${soon ? "text-danger" : "text-indigo"}`}
                          >
                            {percent}%
                          </span>
                        </div>
                        <div className="bg-surface-hover h-2 w-full overflow-hidden rounded-full">
                          <div
                            className={`h-2 rounded-full transition-all ${soon ? "bg-danger" : "bg-indigo"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-surface-muted text-fg-body space-y-1 rounded-xl p-3 text-xs">
                        <div className="flex justify-between gap-2">
                          <span>Ngày phối:</span>
                          <strong className="text-fg">
                            {mating ? formatDate(mating.mating_date) : "—"}
                          </strong>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Dự kiến đẻ:</span>
                          <strong className="text-danger">
                            {mating
                              ? formatDate(mating.expected_farrow_date)
                              : "—"}
                          </strong>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span>Chuồng:</span>
                          <span className="text-fg">{penName}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="shrink-0">Thức ăn:</span>
                          <span className="text-fg text-right">
                            {feed
                              ? `${feed.feedType.name}${
                                  feed.daily_per_head != null
                                    ? ` (${Number(feed.daily_per_head)} kg/con/ngày)`
                                    : ""
                                }`
                              : "Chưa có dữ liệu"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="shrink-0">Vaccine thai kỳ:</span>
                          {vaccine ? (
                            <span className="text-success text-right font-medium">
                              Đã tiêm: {vaccine.name} (
                              {formatDate(vaccine.log_date)})
                            </span>
                          ) : (
                            <span className="text-warning-fg font-medium">
                              Chưa tiêm
                            </span>
                          )}
                        </div>
                      </div>

                      {!mating && (
                        <p className="text-warning-fg text-[11px]">
                          Chưa có lần phối nào ghi nhận cho nái này.
                        </p>
                      )}

                      <Button
                        href="/farrowings"
                        fullWidth
                        leftIcon={<HeartPulseIcon size="xs" />}
                        className="bg-danger rounded-xl text-xs font-semibold"
                      >
                        Ghi Nhận Ca Sinh
                      </Button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
