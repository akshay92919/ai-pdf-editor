import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
/**
 * GET /api/subscription/plans
 * Returns all available plans with pricing in the user's currency.
 * If no user session, defaults to USD.
 */
export async function GET() {
  let currency: "INR" | "USD" = "USD";

  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { currency: true },
      });
      if (user?.currency === "INR") currency = "INR";
    }
  } catch {
    // Default to USD
  }

  const plans = Object.values(PLANS).map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.pricing[currency],
    currency,
    currencySymbol: currency === "INR" ? "₹" : "$",
    interval: plan.pricing[currency] === 0 ? "free" : "month",
    maxFilesPerDay: plan.maxFilesPerDay,
    maxFileSizeMB: Math.round(plan.maxFileSizeBytes / (1024 * 1024)),
    aiToolLimits: plan.aiToolLimits,
    adsEnabled: plan.adsEnabled,
    priorityProcessing: plan.priorityProcessing,
  }));

  return NextResponse.json({ plans, currency });
}
