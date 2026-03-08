import { NextResponse } from "next/server";
import { PLANS, AI_TOOL_IDS, getAiToolLimit } from "@/lib/plans";
import { UsageService } from "@/services/usage.service";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";
/**
 * GET /api/subscription/current
 * Returns the user's current plan, today's usage, and remaining quotas.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, currency: true, email: true },
  });

  const planId = (user?.plan || "spark") as PlanId;
  const plan = PLANS[planId];
  const todayUsage = await UsageService.getTodaysUsage(userId);

  // Build AI tool quota summary
  const aiQuotas: Record<string, { used: number; limit: number | string }> = {};
  for (const toolId of AI_TOOL_IDS) {
    const limit = getAiToolLimit(planId, toolId);
    aiQuotas[toolId] = {
      used: todayUsage[toolId] || 0,
      limit: isFinite(limit) ? limit : "unlimited",
    };
  }

  return NextResponse.json({
    plan: {
      id: plan.id,
      name: plan.name,
      price: plan.pricing[(user?.currency || "USD") as "INR" | "USD"],
      currency: user?.currency || "USD",
    },
    usage: {
      filesProcessedToday: todayUsage["__file_count__"] || 0,
      maxFilesPerDay: plan.maxFilesPerDay,
      maxFileSizeMB: Math.round(plan.maxFileSizeBytes / (1024 * 1024)),
    },
    aiQuotas,
    adsEnabled: plan.adsEnabled,
    priorityProcessing: plan.priorityProcessing,
  });
}
