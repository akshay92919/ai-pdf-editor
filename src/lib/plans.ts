/**
 * Central plan definitions for AI PDF Studio.
 * All limits are enforced server-side by UsageService.
 */

export type PlanId = "spark" | "flow" | "infinity";

export interface AiToolLimits {
  [toolId: string]: number; // Infinity = unlimited
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  maxFilesPerDay: number;
  maxFileSizeBytes: number;
  aiToolLimits: AiToolLimits;
  adsEnabled: boolean;
  priorityProcessing: boolean;
  pricing: {
    INR: number; // monthly, 0 = free
    USD: number;
  };
}

const MB = 1024 * 1024;
const GB = 1024 * MB;

export const PLANS: Record<PlanId, PlanDefinition> = {
  spark: {
    id: "spark",
    name: "Spark",
    maxFilesPerDay: 10,
    maxFileSizeBytes: 25 * MB,
    aiToolLimits: {
      "ai-summarize": 1,
      "ai-extract": 2,
      "ai-explain": 1,
      // All other AI tools: 0 (blocked)
    },
    adsEnabled: true,
    priorityProcessing: false,
    pricing: { INR: 0, USD: 0 },
  },
  flow: {
    id: "flow",
    name: "Flow",
    maxFilesPerDay: 200,
    maxFileSizeBytes: 100 * MB,
    aiToolLimits: {
      "ai-summarize": 20,
      "ai-extract": 20,
      "ai-chat": 5,
      "ai-translate": 10,
      // All other AI tools: 0 (blocked)
    },
    adsEnabled: false,
    priorityProcessing: false,
    pricing: { INR: 200, USD: 3 },
  },
  infinity: {
    id: "infinity",
    name: "Infinity AI",
    maxFilesPerDay: 500,
    maxFileSizeBytes: 1 * GB,
    aiToolLimits: {
      // Every AI tool gets Infinity (unlimited)
      "__default__": Infinity,
    },
    adsEnabled: false,
    priorityProcessing: true,
    pricing: { INR: 500, USD: 6 },
  },
};

/**
 * List of tool IDs that are considered AI tools and need per-tool limit checks.
 */
export const AI_TOOL_IDS = [
  "ai-summarize",
  "ai-extract",
  "ai-explain",
  "ai-chat",
  "ai-translate",
  "ai-notes",
  "ai-qa",
  "ai-search",
  "ai-insights",
  "ai-structured",
  "ai-tags",
  "ai-contract",
  "ai-resume",
  "ai-study",
];

/**
 * Get the daily limit for a specific AI tool under a given plan.
 * Returns 0 if the tool is not explicitly listed and the plan has no __default__.
 */
export function getAiToolLimit(planId: PlanId, toolId: string): number {
  const plan = PLANS[planId];
  if (!plan) return 0;
  if (toolId in plan.aiToolLimits) return plan.aiToolLimits[toolId];
  if ("__default__" in plan.aiToolLimits) return plan.aiToolLimits["__default__"];
  return 0;
}

/**
 * Check if a toolId represents an AI tool.
 */
export function isAiTool(toolId: string): boolean {
  return AI_TOOL_IDS.includes(toolId) || toolId.startsWith("ai-");
}
