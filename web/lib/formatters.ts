// ── Formatting utilities ──

import type { LegacyStatus } from "./types";

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(monthStr: string): string {
  // "2026-03" → "Mar 2026"
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function formatNumber(num: number | string | null | undefined): string {
  if (num == null) return "0";
  return Number(num).toLocaleString("en-US");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function daysSince(dateStr: string | null | undefined): number {
  if (!dateStr) return Infinity;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function statusColor(status: LegacyStatus | string): string {
  switch (status) {
    case "active":
      return "bg-pilgrim-olive";
    case "pending":
      return "bg-secondary";
    case "overdue":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

export function statusLabel(status: LegacyStatus | string): string {
  switch (status) {
    case "active":
      return "Recently Sprayed";
    case "pending":
      return "Pending";
    case "overdue":
      return "Overdue";
    default:
      return status;
  }
}
