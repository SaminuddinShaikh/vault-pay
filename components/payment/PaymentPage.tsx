"use client";

import { ShieldCheck } from "lucide-react";
import { PaymentForm } from "./PaymentForm";
import { StatusScreen } from "./StatusScreen";
import { TransactionHistory } from "./TransactionHistory";

export function PaymentPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-brand-foreground shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Vaultpay</h1>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Secure payments demo
              </p>
            </div>
          </div>
          <span className="hidden sm:inline text-xs text-muted-foreground">
            No real cards. Test environment.
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur p-5 sm:p-7 shadow-card">
              <PaymentForm />
            </div>
            <StatusScreen />
          </div>
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <TransactionHistory />
          </aside>
        </div>
      </div>
    </main>
  );
}
