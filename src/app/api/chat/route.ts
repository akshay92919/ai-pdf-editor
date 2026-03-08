import { streamLocalAI, checkOllamaHealth } from "@/services/localAIService";
import { UsageService, LimitExceededError } from "@/services/usage.service";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { PlanId } from "@/lib/plans";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { messages, toolContext } = await req.json();
    const toolId = toolContext || "ai-chat";

    // ── Auth & Plan Lookup ──
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;
    const userRole = session?.user ? (session.user as any).role : "USER";
    let userPlan: PlanId = "spark";
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (user?.plan) userPlan = user.plan as PlanId;
    }

    // ── Usage Limit Enforcement ──
    await UsageService.checkAiToolLimit(userId || "guest", userPlan, toolId, userRole);

    // ── Ollama Health Check ──
    const ollamaOk = await checkOllamaHealth();
    if (!ollamaOk) {
      return new Response(
        JSON.stringify({ error: "ai_unavailable", message: "Local AI server not running. Please start Ollama with: ollama serve" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Execute AI via Ollama ──
    const systemPrompt = "You are AI PDF Studio's helpful document assistant. Answer questions based on the provided context.";
    const userPrompt = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");

    const stream = streamLocalAI(userPrompt, systemPrompt);

    // Record usage after successful stream initiation
    await UsageService.recordUsage(userId || "guest", toolId);

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    if (error instanceof LimitExceededError) {
      return new Response(
        JSON.stringify({ error: "limit_reached", message: error.message, recommended_plan: error.recommendedPlan }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    console.error("Chat route error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
