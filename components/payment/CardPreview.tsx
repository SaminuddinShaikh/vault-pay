import { detectCardType, maskCardNumber } from "@/utils/card";
import type { CardType } from "@/types/payment";

interface CardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiry: string;
  focused?: "number" | "name" | "expiry" | "cvv" | null;
}

const brandLabel: Record<CardType, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  amex: "AMEX",
  unknown: "CARD",
};

export function CardPreview({ cardNumber, cardholderName, expiry, focused }: CardPreviewProps) {
  const digits = cardNumber.replace(/\D/g, "");
  const type = detectCardType(digits);
  const masked = maskCardNumber(digits, type);

  return (
    <div
      className="relative aspect-[1.586/1] w-full max-w-sm rounded-2xl bg-gradient-card p-6 text-white shadow-card overflow-hidden"
      aria-label="Card preview"
    >
      <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="h-9 w-12 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500/80 shadow-inner" />
          <span className="text-sm font-semibold tracking-widest opacity-90">
            {brandLabel[type]}
          </span>
        </div>

        <div
          className={`font-mono-card text-lg sm:text-xl transition-all ${
            focused === "number" ? "scale-[1.02]" : ""
          }`}
        >
          {masked}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider opacity-70">Cardholder</div>
            <div className="truncate text-sm font-medium uppercase tracking-wide">
              {cardholderName || "YOUR NAME"}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider opacity-70">Expires</div>
            <div className="font-mono-card text-sm">{expiry || "MM/YY"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
