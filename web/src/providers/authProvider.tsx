"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { ACTIVE_FARM_KEY } from "@/lib/axios";
import { authService } from "@/services/authService";
import type { Farm, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  farms: Farm[];
  activeFarm: Farm | null;
  loading: boolean;
  setActiveFarm: (farmId: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pickActiveFarm(farms: Farm[]): Farm | null {
  const saved = window.localStorage.getItem(ACTIVE_FARM_KEY);
  const farm = farms.find((f) => f.id === saved) ?? farms[0] ?? null;
  if (farm) window.localStorage.setItem(ACTIVE_FARM_KEY, farm.id);
  return farm;
}

// Chỉ bọc khu vực đã đăng nhập (dashboard); trang login/register không dùng để tránh vòng lặp redirect
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeFarm, setActiveFarmState] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const [me, myFarms] = await Promise.all([
      authService.me(),
      authService.farms(),
    ]);
    setUser(me);
    setFarms(myFarms);
    setActiveFarmState(pickActiveFarm(myFarms));
  }, []);

  useEffect(() => {
    loadSession()
      .catch(() => router.replace("/login?expired=1"))
      .finally(() => setLoading(false));
  }, [loadSession, router]);

  const setActiveFarm = useCallback(
    (farmId: string) => {
      const farm = farms.find((f) => f.id === farmId);
      if (!farm) return;
      window.localStorage.setItem(ACTIVE_FARM_KEY, farm.id);
      setActiveFarmState(farm);
    },
    [farms],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      window.localStorage.removeItem(ACTIVE_FARM_KEY);
      setUser(null);
      setFarms([]);
      setActiveFarmState(null);
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, farms, activeFarm, loading, setActiveFarm, logout }),
    [user, farms, activeFarm, loading, setActiveFarm, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải dùng bên trong <AuthProvider>");
  return ctx;
}
