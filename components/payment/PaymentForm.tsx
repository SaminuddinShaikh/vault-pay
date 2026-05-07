"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardInput } from "./CardInput";
import { CardPreview } from "./CardPreview";
import { CardBrandBadge } from "./CardBrandBadge";
import {
  detectCardType,
  formatCardNumber,
  formatExpiry,
  getCardMaxDigits,
  getCvvLength,
} from "@/utils/card";
import {
  validateAmount,
  validateCardNumber,
  validateCvv,
  validateExpiry,
  validateName,
  type FormErrors,
} from "@/utils/validation";
import { usePayment } from "@/hooks/usePayment";
import type { Currency, PaymentPayload } from "@/types/payment";

type FocusField = "number" | "name" | "expiry" | "cvv" | null;

export function PaymentForm() {
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState<FocusField>(null);
  const txnIdRef = useRef<string | null>(null);

  const { submit, status, attempts, maxAttempts, canRetry } = usePayment();

  const cardDigits = card.replace(/\D/g, "");
  const cardType = detectCardType(cardDigits);

  const errors: FormErrors = useMemo(
    () => ({
      cardholderName: validateName(name),
      cardNumber: validateCardNumber(card),
      expiry: validateExpiry(expiry),
      cvv: validateCvv(cvv, card),
      amount: validateAmount(amount),
    }),
    [name, card, expiry, cvv, amount]
  );

  const isValid = !Object.values(errors).some(Boolean);
  const isProcessing = status === "processing";
  const isSuccess = status === "success";
  const blocked = !canRetry && (status === "failed" || status === "timeout");
  const disabled = (!isValid || isProcessing || blocked || isSuccess) ? true : false;

  useEffect(() => {
    if (status === "idle") {
      txnIdRef.current = null;
    }
  }, [status]);

  function visibleError(field: keyof FormErrors): string | undefined {
    return touched[field] ? errors[field] : undefined;
  }

  function markTouched(field: keyof FormErrors) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({
      cardholderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
      amount: true,
    });
    if (!isValid || isProcessing || blocked) return;

    if (!txnIdRef.current) {
      txnIdRef.current = crypto.randomUUID();
    }

    const payload: PaymentPayload = {
      transactionId: txnIdRef.current,
      cardholderName: name.trim(),
      cardNumber: cardDigits,
      expiry,
      cvv,
      amount: Number(amount),
      currency,
    };

    await submit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]" noValidate>
      <div className="order-1 lg:order-2 flex flex-col items-center justify-start gap-4 lg:sticky lg:top-6">
        <CardPreview
          cardNumber={card}
          cardholderName={name}
          expiry={expiry}
          focused={focused}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
         { amount && (<><Lock className="h-3.5 w-3.5" /> <p>Securely PAY {currency === "INR" ? "₹" : "$"} {amount}</p></>)}
        </div>
      </div>
      <div className="order-2 lg:order-1 space-y-1">
        <CardInput
          label="Cardholder name"
          value={name}
          onChange={setName}
          onBlur={() => markTouched("cardholderName")}
          onFocus={() => setFocused("name")}
          error={visibleError("cardholderName")}
          placeholder="John Doe"
          autoComplete="cc-name"
          required
        />

        <CardInput
          label="Card number"
          value={formatCardNumber(card)}
          onChange={(v) => {
            const digits = v.replace(/\D/g, "").slice(0, getCardMaxDigits(detectCardType(v)));
            setCard(digits);
          }}
          onBlur={() => markTouched("cardNumber")}
          onFocus={() => setFocused("number")}
          error={visibleError("cardNumber")}
          placeholder="1234 5678 9012 3456"
          inputMode="numeric"
          autoComplete="cc-number"
          rightSlot={<CardBrandBadge type={cardType} />}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <CardInput
            label="Expiry"
            value={expiry}
            onChange={(v) => setExpiry(formatExpiry(v))}
            onBlur={() => markTouched("expiry")}
            onFocus={() => setFocused("expiry")}
            error={visibleError("expiry")}
            placeholder="MM/YY"
            inputMode="numeric"
            autoComplete="cc-exp"
            maxLength={5}
            required
          />
          <CardInput
            label="CVV"
            value={cvv}
            onChange={(v) => setCvv(v.replace(/\D/g, "").slice(0, getCvvLength(cardType)))}
            onBlur={() => markTouched("cvv")}
            onFocus={() => setFocused("cvv")}
            error={visibleError("cvv")}
            placeholder={cardType === "amex" ? "4 digits" : "3 digits"}
            inputMode="numeric"
            autoComplete="cc-csc"
            required
          />
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3">
          <CardInput
            label="Amount"
            value={amount}
            onChange={(v) => setAmount(v.replace(/[^\d.]/g, ""))}
            onBlur={() => markTouched("amount")}
            error={visibleError("amount")}
            placeholder="0.00"
            inputMode="decimal"
            required
          />
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Currency
            </label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="h-11 bg-surface-elevated border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
              </SelectContent>
            </Select>
            <p className="min-h-4 text-xs"> </p>
          </div>
        </div>

        {attempts > 0 && (status === "failed" || status === "timeout") && canRetry && (
          <p className="text-xs text-warning" role="status">
            Attempt {attempts} of {maxAttempts}
          </p>
        )}

        {!isSuccess && <Button
          type="submit"
          disabled={disabled} 
          className={`mt-2 h-12 w-full bg-gradient-brand text-brand-foreground font-semibold hover:opacity-95 hover:shadow-glow disabled:opacity-50 ${disabled ? "cursor-wait opacity-50" : "cursor-pointer"}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
            </>
          ) : attempts > 0 && (status === "failed" || status === "timeout") ? (
            `Retry payment (${attempts}/${maxAttempts})`
          ) : (
            `Pay ${currency === "INR" ? "₹" : "$"}${amount || "0.00"}`
          )}
        </Button>}
      </div>
    </form>
  );
}
