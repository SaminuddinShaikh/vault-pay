import { configureStore } from "@reduxjs/toolkit";
import paymentReducer, { persistHistoryMiddleware, storeRef } from "./paymentSlice";

export const store = configureStore({
  reducer: { payment: paymentReducer },
  middleware: (getDefault) => getDefault().concat(persistHistoryMiddleware),
});

storeRef.current = store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
