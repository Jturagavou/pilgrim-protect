// ── Formatting utilities ──

export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatMonth(monthStr) {
  // "2026-03" → "Mar 2026"
  const [year, month] = monthStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export function formatNumber(num) {
  if (num == null) return "0";
  return Number(num).toLocaleString("en-US");
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function statusColor(status) {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "pending":
      return "bg-orange-500";
    case "overdue":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

export function statusLabel(status) {
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
