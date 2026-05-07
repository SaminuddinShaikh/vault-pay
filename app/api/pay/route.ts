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

  // 15% chance of simulated timeout (responds after 8s — frontend cancels at 6s)
  if (r > 0.85) {
    await new Promise((resolve) => setTimeout(resolve, 8_000));
  }

  // Of the remaining 85%: 60% success, 25% failure
  const outcome: "success" | "failed" = r < 0.6 ? "success" : "failed";

  return NextResponse.json({
    transactionId: body.transactionId,
    status: outcome,
    ...(outcome === "failed" ? { reason: pickReason() } : {}),
  });
}
