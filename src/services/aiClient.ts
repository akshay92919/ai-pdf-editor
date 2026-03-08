import { checkOllamaHealth } from "@/services/localAIService";

/**
 * AIClient - now wraps the local Ollama AI server instead of OpenAI.
 * Provides validation and health checking for the local AI backend.
 */
export class AIClient {
  /**
   * Check if the local Ollama AI server is available.
   * Returns null if healthy, or a structured error object if not.
   */
  static async validateServer(): Promise<null | { error: string; message: string }> {
    const healthy = await checkOllamaHealth();
    if (!healthy) {
      return {
        error: "ai_unavailable",
        message: "Local AI server not running. Please start Ollama with: ollama serve",
      };
    }
    return null;
  }

  /**
   * Legacy compatibility — always returns null since we no longer need API keys.
   * @deprecated Use validateServer() instead
   */
  static validateKey(): null {
    return null;
  }
}
