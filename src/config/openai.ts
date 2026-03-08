/**
 * AI Configuration - Local Ollama
 * 
 * This application uses Ollama for local AI processing.
 * No external API keys are required.
 * 
 * To start the AI backend:
 *   ollama serve
 * 
 * To install a model:
 *   ollama pull llama3
 */

export const AI_CONFIG = {
  provider: "ollama",
  baseUrl: process.env.OLLAMA_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3",
};

console.log(`[AI Config] Using local Ollama AI (${AI_CONFIG.baseUrl}, model: ${AI_CONFIG.model})`);
