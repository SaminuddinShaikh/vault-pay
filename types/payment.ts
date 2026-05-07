export type CardType = "visa" | "mastercard" | "amex" | "unknown";

export type PaymentStatus = "idle" | "processing" | "success" | "failed" | "timeout";

export type Currency = "INR" | "USD";

export interface PaymentPayload {
  transactionId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export interface GatewayResponse {
  transactionId: string;
  status: "success" | "failed";
  reason?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  reason?: string;
  timestamp: number;
  attempts: number;
  cardLast4: string;
  cardType: CardType;
}
