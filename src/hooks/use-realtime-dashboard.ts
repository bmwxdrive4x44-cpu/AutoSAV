"use client";

import { useEffect, useState, useCallback } from "react";
import type { DashboardSummary } from "@/app/actions/dashboard";

interface UseRealtimeDashboardOptions {
  initialData: DashboardSummary;
  onRefresh: () => Promise<DashboardSummary>;
}

export function useRealtimeDashboard({ initialData, onRefresh }: UseRealtimeDashboardOptions) {
  const [data, setData] = useState<DashboardSummary>(initialData);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    setData(initialData);
    setLastUpdated(new Date());
  }, [initialData]);

  const refresh = useCallback(async () => {
    try {
      const fresh = await onRefresh();
      setData(fresh);
      setLastUpdated(new Date());
    } catch {
      // silent — garde les données actuelles
    }
  }, [onRefresh]);

  useEffect(() => {
    // Polling 30s compatible Supabase free tier (pas de websockets requis)
    const interval = setInterval(() => {
      refresh();
    }, 30_000);

    setIsLive(true);

    return () => {
      clearInterval(interval);
    };
  }, [refresh]);

  return { data, isLive, lastUpdated, refresh };
}
