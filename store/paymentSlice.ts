import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PaymentStatus, Transaction } from "@/types/payment";

interface PaymentState {
  status: PaymentStatus;
  attempts: number;
  currentTxnId: string | null;
  lastReason?: string;
  history: Transaction[];
  selectedTxnId: string | null;
}

const STORAGE_KEY = "payment-history-v1";

function loadHistory(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { history?: Transaction[] };
    return parsed.history ?? [];
  } catch {
    return [];
  }
}

const initialState: PaymentState = {
  status: "idle",
  attempts: 0,
  currentTxnId: null,
  history: loadHistory(),
  selectedTxnId: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<{ status: PaymentStatus; reason?: string }>) {
      state.status = action.payload.status;
      state.lastReason = action.payload.reason;
    },
    startTransaction(state, action: PayloadAction<string>) {
      state.currentTxnId = action.payload;
      state.attempts = 0;
      state.status = "idle";
      state.lastReason = undefined;
    },
    incrementAttempt(state) {
      state.attempts += 1;
    },
    resetCurrent(state) {
      state.currentTxnId = null;
      state.attempts = 0;
      state.status = "idle";
      state.lastReason = undefined;
    },
    upsertTransaction(state, action: PayloadAction<Transaction>) {
      const txn = action.payload;
      const idx = state.history.findIndex((t) => t.id === txn.id);
      if (idx >= 0) {
        state.history[idx] = txn;
      } else {
        state.history.unshift(txn);
      }
      state.history = state.history.slice(0, 50);
    },
    selectTransaction(state, action: PayloadAction<string | null>) {
      state.selectedTxnId = action.payload;
    },
    clearHistory(state) {
      state.history = [];
    },
  },
});

export const {
  setStatus,
  startTransaction,
  incrementAttempt,
  resetCurrent,
  upsertTransaction,
  selectTransaction,
  clearHistory,
} = paymentSlice.actions;

export const persistHistoryMiddleware =
  () => (next: (a: unknown) => unknown) => (action: unknown) => {
    const result = next(action);
    if (typeof window !== "undefined") {
      try {
        const state = storeRef.current?.getState() as { payment: PaymentState } | undefined;
        if (state) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: state.payment.history }));
        }
      } catch {
        console.log("Failed to persist payment history");
      }
    }
    return result;
  };

export const storeRef: { current: { getState: () => unknown } | null } = {
  current: null,
};

export default paymentSlice.reducer;
