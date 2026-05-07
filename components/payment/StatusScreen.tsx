"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Clock, Loader2, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetCurrent } from "@/store/paymentSlice";
import { MAX_RETRIES } from "@/utils/constants";

function canRetry(attempts: number): boolean {
  return attempts < MAX_RETRIES;
}

export function StatusScreen() {
  const status = useAppSelector((s) => s.payment.status);
  const attempts = useAppSelector((s) => s.payment.attempts);
  const reason = useAppSelector((s) => s.payment.lastReason);
  const txnId = useAppSelector((s) => s.payment.currentTxnId);
  const dispatch = useAppDispatch();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status !== "idle") headingRef.current?.focus();
  }, [status]);

  if (status === "idle") return null;

  const finalFailure = !canRetry(attempts) && (status === "failed" || status === "timeout");

  const config = {
    processing: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-brand" />,
      title: "Processing payment",
      desc: "Please don't close or refresh this window.",
      tone: "border-brand/30 bg-brand/5",
    },
    success: {
      icon: <CheckCircle2 className="h-10 w-10 text-success" />,
      title: "Payment successful",
      desc: "Your transaction has been confirmed.",
      tone: "border-success/30 bg-success/5",
    },
    failed: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: finalFailure ? "Payment declined" : "Payment failed",
      desc: reason ?? "Something went wrong.",
      tone: "border-destructive/30 bg-destructive/5",
    },
    timeout: {
      icon: <Clock className="h-10 w-10 text-warning" />,
      title: "Request timed out",
      desc: reason ?? "The gateway didn't respond in time.",
      tone: "border-warning/30 bg-warning/5",
    },
  }[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border p-6 ${config.tone}`}
    >
      <div className="flex items-start gap-4">
        <div>{config.icon}</div>
        <div className="flex-1">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-semibold outline-none"
          >
            {config.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{config.desc}</p>
          {txnId && (
            <p className="mt-2 font-mono-card text-[11px] text-muted-foreground">
              ID: {txnId}
            </p>
          )}

          {(status === "failed" || status === "timeout") && (
            <div className="mt-4 flex flex-wrap gap-2">
              {finalFailure ? (
                <Button
                  variant="outline"
                  onClick={() => dispatch(resetCurrent())}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> Start new payment
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Submit the form again to retry. Attempts used: {attempts}/{MAX_RETRIES}
                </p>
              )}
            </div>
          )}

          {status === "success" && (
            <Button
              variant="outline"
              onClick={() => dispatch(resetCurrent())}
              className="mt-4 gap-2"
            >
              <RotateCcw className="h-4 w-4" /> New payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
