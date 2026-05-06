import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PaymentStatus } from "@/types/payment";

interface PaymentState {
  status: PaymentStatus;
  attempts: number;
  currentTxnId: string | null;
  selectedTxnId: string | null;
}

const STORAGE_KEY = "payment-history-v1";

const initialState: PaymentState = {
  status: "idle",
  attempts: 0,
  currentTxnId: null,
  selectedTxnId: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<{ status: PaymentStatus; }>) {
      state.status = action.payload.status;
    },
    startTransaction(state, action: PayloadAction<string>) {
      state.currentTxnId = action.payload;
      state.attempts = 0;
      state.status = "idle";
    },
    incrementAttempt(state) {
      state.attempts += 1;
    },
  },
});

export const {
  setStatus,
  startTransaction,
  incrementAttempt,
} = paymentSlice.actions;

export const persistHistoryMiddleware =
  () => (next: (a: unknown) => unknown) => (action: unknown) => {
    const result = next(action);
    if (typeof window !== "undefined") {
      try {
        const state = storeRef.current?.getState() as { payment: PaymentState } | undefined;
        if (state) {
          console.log("Persisting payment state to localStorage:", state.payment);
        }
      } catch {
      }
    }
    return result;
  };

export const storeRef: { current: { getState: () => unknown } | null } = {
  current: null,
};

export default paymentSlice.reducer;
