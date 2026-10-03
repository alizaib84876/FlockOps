"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { liveQuery } from "dexie";
import { db } from "@/lib/offline/db";
import { processSyncQueue } from "@/lib/offline/queue";

type OfflineContextValue = {
  online: boolean;
  pendingCount: number;
  syncing: boolean;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue>({
  online: true,
  pendingCount: 0,
  syncing: false,
  syncNow: async () => {},
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const syncNow = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setSyncing(true);
    try {
      await processSyncQueue();
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      void syncNow();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const interval = window.setInterval(() => {
      if (navigator.onLine) void syncNow();
    }, 20000);
    void syncNow();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.clearInterval(interval);
    };
  }, [syncNow]);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.syncQueue.where("status").equals("PENDING").count(),
    ).subscribe({
      next: setPendingCount,
      error: () => setPendingCount(0),
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({ online, pendingCount, syncing, syncNow }),
    [online, pendingCount, syncing, syncNow],
  );

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
