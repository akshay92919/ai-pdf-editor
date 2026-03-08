import { prisma } from "@/lib/db";
import { PLANS, PlanId, getAiToolLimit, isAiTool } from "@/lib/plans";

/** Thrown when a usage limit is exceeded. Caught by the API route to return structured JSON. */
export class LimitExceededError extends Error {
  public recommendedPlan: string;
  constructor(message: string, recommendedPlan: string) {
    super(message);
    this.name = "LimitExceededError";
    this.recommendedPlan = recommendedPlan;
  }
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function nextPlan(current: PlanId): string {
  if (current === "spark") return "Flow";
  if (current === "flow") return "Infinity AI";
  return "Infinity AI";
}

export class UsageService {
  /** Returns true if running in development mode — all limits are bypassed */
  private static get isDev(): boolean {
    return process.env.NODE_ENV === "development";
  }

  /**
   * Check if a single file exceeds the plan's size limit.
   */
  static checkFileSizeLimit(planId: PlanId, fileSizeBytes: number, role: string = "USER"): void {
    if (this.isDev || role === "ADMIN") return;
    const plan = PLANS[planId] || PLANS.spark;
    if (fileSizeBytes > plan.maxFileSizeBytes) {
      const limitMB = Math.round(plan.maxFileSizeBytes / (1024 * 1024));
      throw new LimitExceededError(
        `File size exceeds your plan limit of ${limitMB}MB. Upgrade to ${nextPlan(planId)} for larger files.`,
        nextPlan(planId)
      );
    }
  }

  /**
   * Check if user has exceeded their daily file count limit.
   */
  static async checkDailyFileCount(userId: string, plan: PlanId, numFiles: number = 1, role: string = "USER"): Promise<void> {
    if (this.isDev || role === "ADMIN") return;
    const today = todayString();
    const planLimits = PLANS[plan];

    const record = await prisma.dailyUsage.findUnique({
      where: { userId_toolId_usageDate: { userId, toolId: "__file_count__", usageDate: today } },
    });

    const currentUsage = record ? record.usageCount : 0;
    if (currentUsage + numFiles > planLimits.maxFilesPerDay) {
      throw new LimitExceededError(
        `Daily file limit reached. You can process up to ${planLimits.maxFilesPerDay} files/day.`,
        plan === 'spark' ? 'Flow' : 'Infinity AI'
      );
    }
  }

  /**
   * Check if the user has exceeded the daily limit for a specific AI tool.
   */
  static async checkAiToolLimit(userId: string, planId: PlanId, toolId: string, role: string = "USER"): Promise<void> {
    if (this.isDev || role === "ADMIN") return;
    if (!isAiTool(toolId)) return; // Non-AI tools are only gated by file count

    const limit = getAiToolLimit(planId, toolId);

    if (limit === 0) {
      throw new LimitExceededError(
        `The ${toolId} feature is not available on your ${PLANS[planId]?.name || "current"} plan. Upgrade to ${nextPlan(planId)} to unlock it.`,
        nextPlan(planId)
      );
    }

    if (!isFinite(limit)) return; // Infinity = unlimited

    const today = todayString();
    const record = await prisma.dailyUsage.findUnique({
      where: { userId_toolId_usageDate: { userId, toolId, usageDate: today } },
    });

    const currentCount = record?.usageCount ?? 0;
    if (currentCount >= limit) {
      throw new LimitExceededError(
        `You reached today's limit of ${limit} uses for ${toolId}. Upgrade to ${nextPlan(planId)} for higher usage.`,
        nextPlan(planId)
      );
    }
  }

  /**
   * Increment the daily usage counter for a tool (or __file_count__).
   * Uses upsert to atomically create or increment.
   */
  static async incrementUsage(userId: string, toolId: string, amount: number = 1): Promise<void> {
    const today = todayString();
    await prisma.dailyUsage.upsert({
      where: { userId_toolId_usageDate: { userId, toolId, usageDate: today } },
      update: { usageCount: { increment: amount } },
      create: { userId, toolId, usageDate: today, usageCount: amount },
    });
  }

  /**
   * Run all pre-execution checks for a PDF/conversion tool.
   * Call this before processing begins.
   */
  static async enforceToolLimits(
    userId: string | null,
    planId: PlanId,
    toolId: string,
    files: File[],
    role: string = "USER"
  ): Promise<void> {
    if (this.isDev || role === "ADMIN") return;
    // Guest users get Spark limits
    const effectivePlan = planId || "spark";
    const effectiveUserId = userId || "guest";

    // 1. File size check
    for (const file of files) {
      this.checkFileSizeLimit(effectivePlan, file.size);
    }

    // 2. Daily file count check
    await this.checkDailyFileCount(effectiveUserId, effectivePlan);

    // 3. AI tool limit check
    await this.checkAiToolLimit(effectiveUserId, effectivePlan, toolId);
  }

  /**
   * Record successful usage (call after processing succeeds).
   */
  static async recordUsage(userId: string | null, toolId: string): Promise<void> {
    const effectiveUserId = userId || "guest";
    // Increment tool-specific counter
    await this.incrementUsage(effectiveUserId, toolId);
  }

  /**
   * Specifically record successful processing of N files against the global daily counter.
   */
  static async recordFileUsage(userId: string | null, numFiles: number): Promise<void> {
    const effectiveUserId = userId || "guest";
    await this.incrementUsage(effectiveUserId, "__file_count__", numFiles);
  }

  /**
   * Get today's usage summary for a user.
   */
  static async getTodaysUsage(userId: string): Promise<Record<string, number>> {
    const today = todayString();
    const records = await prisma.dailyUsage.findMany({
      where: { userId, usageDate: today },
    });
    const usage: Record<string, number> = {};
    for (const r of records) {
      usage[r.toolId] = r.usageCount;
    }
    return usage;
  }
}
