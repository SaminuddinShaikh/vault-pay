import { NextRequest, NextResponse } from "next/server";
import type { GatewayResponse, PaymentPayload } from "@/types/payment";

const FAILURE_REASONS = [
  "Insufficient funds",
  "Card declined by issuer",
  "Do not honour",
  "Risk check failed",
] as const;

function pickReason(): string {
  return FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
}

export async function POST(req: NextRequest): Promise<NextResponse<GatewayResponse>> {
  const body = (await req.json()) as PaymentPayload;
  const r = Math.random();

  // Explicit buckets: 0–0.60 success, 0.60–0.85 failed, 0.85–1.0 timeout
  if (r > 0.85) {
    await new Promise((resolve) => setTimeout(resolve, 10_000));
    return NextResponse.json({ transactionId: body.transactionId, status: "failed" });
  }

  const outcome = r < 0.60 ? "success" : "failed";

  return NextResponse.json({
    transactionId: body.transactionId,
    status: outcome,
    ...(outcome === "failed" ? { reason: pickReason() } : {}),
  });
}
