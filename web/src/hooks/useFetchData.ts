"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { parseApiError } from "@/lib/apiError";

// Gọi API khi mount và mỗi lần refetch(). `loading` chỉ true ở lần tải đầu,
// refetch sau đó giữ nguyên dữ liệu cũ để bảng không nháy về "Đang tải...".
// Nhiều API cùng lúc: `useFetchData(() => Promise.all([a(), b()]))`.
// Muốn tải lại khi tham số đổi (vd. đổi trang trại): remount component bằng `key`.
export function useFetchData<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Luôn gọi bản fetcher mới nhất, tránh closure cũ mà không cần khai báo deps
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, error, loading, refetch };
}
