import type { CardType } from "@/types/payment";
import { cn } from "@/lib/utils";

const styles: Record<CardType, string> = {
  visa: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  mastercard: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  amex: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  unknown: "bg-muted text-muted-foreground border-border",
};

const labels: Record<CardType, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  unknown: "CARD",
};

export function CardBrandBadge({ type }: { type: CardType }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2 text-[10px] font-bold tracking-widest",
        styles[type]
      )}
    >
      {labels[type]}
    </span>
  );
}
