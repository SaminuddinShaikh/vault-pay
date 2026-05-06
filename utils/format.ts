import type { Currency } from "@/types/payment";

export function formatCurrency(amount: number, currency: Currency): string {
  const locale = currency === "INR" ? "en-IN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}
