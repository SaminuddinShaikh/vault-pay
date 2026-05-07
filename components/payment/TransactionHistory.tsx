"use client";

import { CheckCircle2, XCircle, Clock, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectTransaction, clearHistory } from "@/store/paymentSlice";
import { formatCurrency, formatTimestamp } from "@/utils/format";
import type { PaymentStatus } from "@/types/payment";
import { useState, useEffect } from "react";

const statusIcon: Record<PaymentStatus, React.ReactElement> = {
  idle: <Receipt className="h-4 w-4 text-muted-foreground" />,
  processing: <Loader2 className="h-4 w-4 animate-spin text-brand" />,
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  failed: <XCircle className="h-4 w-4 text-destructive" />,
  timeout: <Clock className="h-4 w-4 text-warning" />,
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-1.5 last:border-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}

export function TransactionHistory() {
  const history = useAppSelector((s) => s.payment.history);
  const selectedId = useAppSelector((s) => s.payment.selectedTxnId);
  const dispatch = useAppDispatch();
  const selected = history.find((t) => t.id === selectedId) ?? null;

   const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section
      aria-label="Transaction history"
      className="rounded-xl border border-border bg-surface/50 backdrop-blur p-5"
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent transactions
        </h2>
        {mounted && history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => dispatch(clearHistory())}
            className="h-7 text-xs text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </header>

      {!mounted || history.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">No transactions yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => dispatch(selectTransaction(t.id))}
                className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-surface-elevated/40 px-2 -mx-2 rounded-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {statusIcon[t.status]}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {formatCurrency(t.amount, t.currency)} &bull;{" "}
                      <span className="font-mono-card text-xs text-muted-foreground">
                        ••{t.cardLast4}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {formatTimestamp(t.timestamp)}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] capitalize text-muted-foreground">{t.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && dispatch(selectTransaction(null))}
      >
        <DialogContent className="bg-surface border-border">
          <DialogHeader>
            <DialogTitle>Transaction details</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="space-y-2 text-sm">
              <Row label="ID" value={<span className="font-mono-card text-xs">{selected.id}</span>} />
              <Row label="Amount" value={formatCurrency(selected.amount, selected.currency)} />
              <Row
                label="Status"
                value={
                  <span className="inline-flex items-center gap-2 capitalize">
                    {statusIcon[selected.status]} {selected.status}
                  </span>
                }
              />
              {selected.reason && <Row label="Reason" value={selected.reason} />}
              <Row label="Card" value={`${selected.cardType.toUpperCase()} ••${selected.cardLast4}`} />
              <Row label="Attempts" value={String(selected.attempts)} />
              <Row label="Time" value={formatTimestamp(selected.timestamp)} />
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
