"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { healthLogService } from "@/services/healthLogService";
import { matingService } from "@/services/matingService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { reminderService } from "@/services/reminderService";
import { saleService } from "@/services/saleService";
import { sowService } from "@/services/sowService";
import {
  buildNotifications,
  type AppNotification,
  type NotificationSource,
} from "@/utils/notifications";

const REFRESH_MS = 3 * 60 * 1000;
const MAX_READ_KEYS = 300;

// Thông báo đã đọc lưu theo từng trại trong trình duyệt (chỉ là tiện ích, mất đi thì thông báo hiện lại như mới)
const storageKey = (farmId: string) => `smartpig.notificationsRead.${farmId}`;

function loadRead(farmId: string): string[] {
  try {
    const raw = window.localStorage.getItem(storageKey(farmId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((k) => typeof k === "string")
      : [];
  } catch {
    return [];
  }
}

function saveRead(farmId: string, keys: string[]) {
  try {
    window.localStorage.setItem(
      storageKey(farmId),
      JSON.stringify(keys.slice(-MAX_READ_KEYS)),
    );
  } catch {
    // trình duyệt chặn lưu trữ: bỏ qua
  }
}

// Danh sách thông báo của trại đang chọn + số chưa đọc. Tải lại khi đổi trang, khi quay lại cửa sổ và mỗi vài phút.
export function useNotifications(farmId: string | undefined) {
  const pathname = usePathname();
  const [source, setSource] = useState<{
    farmId: string;
    data: NotificationSource;
  } | null>(null);
  const [readState, setReadState] = useState<{
    farmId: string;
    keys: string[];
  } | null>(null);

  // Tải lại khi đổi trang / đổi trại, khi quay lại cửa sổ và mỗi vài phút
  useEffect(() => {
    if (!farmId) return;
    let cancelled = false;

    const run = async () => {
      try {
        const [sows, matings, batches, healthLogs, reminders, sales] =
          await Promise.all([
            sowService.list(),
            matingService.list(),
            pigletBatchService.list(),
            healthLogService.list(),
            reminderService.list(),
            saleService.list(),
          ]);
        if (!cancelled) {
          setSource({
            farmId,
            data: { sows, matings, batches, healthLogs, reminders, sales },
          });
        }
      } catch {
        // lỗi mạng / hết phiên: giữ danh sách cũ, phần xác thực của app lo việc đăng nhập lại
      }
    };

    void run();
    const timer = window.setInterval(() => void run(), REFRESH_MS);
    const onFocus = () => void run();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [farmId, pathname]);

  const items = useMemo<AppNotification[]>(
    () =>
      source && source.farmId === farmId ? buildNotifications(source.data) : [],
    [source, farmId],
  );

  const readKeys = useMemo(() => {
    if (!farmId) return new Set<string>();
    const keys =
      readState?.farmId === farmId ? readState.keys : loadRead(farmId);
    return new Set(keys);
  }, [farmId, readState]);

  const markRead = useCallback(
    (key: string) => {
      if (!farmId) return;
      const keys = [...loadRead(farmId).filter((k) => k !== key), key];
      saveRead(farmId, keys);
      setReadState({ farmId, keys });
    },
    [farmId],
  );

  const markAllRead = useCallback(() => {
    if (!farmId) return;
    const keys = [
      ...new Set([...loadRead(farmId), ...items.map((i) => i.key)]),
    ];
    saveRead(farmId, keys);
    setReadState({ farmId, keys });
  }, [farmId, items]);

  const unreadCount = items.filter((i) => !readKeys.has(i.key)).length;

  return { items, readKeys, unreadCount, markRead, markAllRead };
}
