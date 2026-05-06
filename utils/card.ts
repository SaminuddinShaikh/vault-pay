import type { CardType } from "@/types/payment";

export function detectCardType(num: string): CardType {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "unknown";
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  const type = detectCardType(digits);
  if (type === "amex") {
    return digits
      .slice(0, 15)
      .replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" ")
      );
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function getCvvLength(type: CardType): number {
  return type === "amex" ? 4 : 3;
}

export function getCardMaxDigits(type: CardType): number {
  return type === "amex" ? 15 : 16;
}

export function maskCardNumber(digits: string, type: CardType): string {
  const total = getCardMaxDigits(type);
  const padded = digits.padEnd(total, "•");
  if (type === "amex") {
    return padded.replace(/^(.{4})(.{6})(.{5}).*/, "$1 $2 $3");
  }
  return padded.replace(/(.{4})/g, "$1 ").trim();
}
