"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStatus,
  startTransaction,
  incrementAttempt,
  resetCurrent,
  upsertTransaction,
} from "@/store/paymentSlice";
import { REQUEST_TIMEOUT_MS, MAX_RETRIES } from "@/utils/constants";
import { detectCardType } from "@/utils/card";
import type { GatewayResponse, PaymentPayload, Transaction } from "@/types/payment";

export function usePayment() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.payment.status);
  const attempts = useAppSelector((s) => s.payment.attempts);
  const currentTxnId = useAppSelector((s) => s.payment.currentTxnId);
  const lastReason = useAppSelector((s) => s.payment.lastReason);

  const submit = useCallback(
    async (payload: PaymentPayload) => {
      if (attempts >= MAX_RETRIES) return;
      if (!currentTxnId) dispatch(startTransaction(payload.transactionId));

      dispatch(incrementAttempt());
      dispatch(setStatus({ status: "processing" }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const cardType = detectCardType(payload.cardNumber);
      const last4 = payload.cardNumber.slice(-4);

      const baseTxn: Transaction = {
        id: payload.transactionId,
        amount: payload.amount,
        currency: payload.currency,
        status: "processing",
        timestamp: Date.now(),
        attempts: attempts + 1,
        cardLast4: last4,
        cardType,
      };
      dispatch(upsertTransaction(baseTxn));

      try {
        const res = await fetch("/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Gateway returned ${res.status}`);
        }

        const data = (await res.json()) as GatewayResponse;
        const finalStatus = data.status === "success" ? "success" : "failed";

        dispatch(setStatus({ status: finalStatus, reason: data.reason }));
        dispatch(
          upsertTransaction({
            ...baseTxn,
            status: finalStatus,
            reason: data.reason,
            timestamp: Date.now(),
            attempts: attempts + 1,
          })
        );
      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        const finalStatus = isAbort ? "timeout" : "failed";
        const reason = isAbort
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection.";

        dispatch(setStatus({ status: finalStatus, reason }));
        dispatch(
          upsertTransaction({
            ...baseTxn,
            status: finalStatus,
            reason,
            timestamp: Date.now(),
            attempts: attempts + 1,
          })
        );
      }
    },
    [attempts, currentTxnId, dispatch]
  );

  return {
    status,
    attempts,
    maxAttempts: MAX_RETRIES,
    lastReason,
    submit,
    reset: () => dispatch(resetCurrent()),
    canRetry: attempts < MAX_RETRIES,
  };
}
