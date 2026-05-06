import { detectCardType, getCvvLength, getCardMaxDigits } from "./card";

export interface FormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  amount?: string;
}

export function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function validateName(v: string): string | undefined {
  if (!v.trim()) return "Cardholder name is required";
  if (v.trim().length < 2) return "Name is too short";
  if (!/^[a-zA-Z\s.'-]+$/.test(v)) return "Name contains invalid characters";
}

export function validateCardNumber(v: string): string | undefined {
  const digits = v.replace(/\D/g, "");
  const type = detectCardType(digits);
  const max = getCardMaxDigits(type);
  if (!digits) return "Card number is required";
  if (digits.length < max) return `Card number must be ${max} digits`;
  if (!luhnCheck(digits)) return "Invalid card number";
}

export function validateExpiry(v: string): string | undefined {
  if (!v) return "Expiry is required";
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m) return "Use MM/YY format";
  const month = parseInt(m[1], 10);
  const year = 2000 + parseInt(m[2], 10);
  if (month < 1 || month > 12) return "Invalid month";
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  if (exp < now) return "Card has expired";
}

export function validateCvv(v: string, cardNumber: string): string | undefined {
  const type = detectCardType(cardNumber);
  const len = getCvvLength(type);
  if (!v) return "CVV is required";
  if (!new RegExp(`^\\d{${len}}$`).test(v)) return `CVV must be ${len} digits`;
}

export function validateAmount(v: string): string | undefined {
  if (!v) return "Amount is required";
  const n = Number(v);
  if (Number.isNaN(n)) return "Amount must be a number";
  if (n <= 0) return "Amount must be greater than 0";
  if (n > 1_000_000) return "Amount is too large";
}
