import { todayIsoDate } from "@/lib/logs/types";
import type { UserRole } from "@/lib/auth/profile";

function shiftIsoDate(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function workerWriteWindowStart() {
  return shiftIsoDate(todayIsoDate(), -1);
}

export function dailyLogWriteBlock(
  role: UserRole,
  logDate: string,
  flockStatus?: string | null,
) {
  if (flockStatus && flockStatus !== "ACTIVE") {
    return "This batch is closed. Logs cannot be added.";
  }
  if (role !== "WORKER") return null;
  if (logDate >= workerWriteWindowStart()) return null;
  return "This date cannot be edited.";
}

export function canWriteDailyLog(
  role: UserRole,
  logDate: string,
  flockStatus?: string | null,
) {
  return dailyLogWriteBlock(role, logDate, flockStatus) === null;
}
