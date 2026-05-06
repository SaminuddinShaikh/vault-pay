"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStatus,
  startTransaction,
  incrementAttempt,
} from "@/store/paymentSlice";
import { REQUEST_TIMEOUT_MS, MAX_RETRIES } from "@/utils/constants";
import { detectCardType } from "@/utils/card";
import type { GatewayResponse, PaymentPayload } from "@/types/payment";

export function usePayment() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.payment.status);
  const attempts = useAppSelector((s) => s.payment.attempts);
  const currentTxnId = useAppSelector((s) => s.payment.currentTxnId);

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
      } catch (err) {
        clearTimeout(timeoutId);
        const isAbort = err instanceof DOMException && err.name === "AbortError";
        const finalStatus = isAbort ? "timeout" : "failed";

        dispatch(setStatus({ status: finalStatus }));
      }
    },
    [attempts, currentTxnId, dispatch]
  );

  return {
    status,
    attempts,
    maxAttempts: MAX_RETRIES,
    submit,
    canRetry: attempts < MAX_RETRIES,
  };
}
