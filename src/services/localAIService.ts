/**
 * Local AI Service using Ollama
 * Replaces OpenAI with a locally-running LLM via Ollama HTTP API.
 */

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

/**
 * Check if the Ollama server is running and reachable.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Run a non-streaming prompt against the Ollama local model.
 */
export async function runLocalAI(prompt: string, system?: string): Promise<string> {
  console.log("Using local Ollama AI model");

  const healthy = await checkOllamaHealth();
  if (!healthy) {
    throw new Error("Local AI server not running. Please start Ollama with: ollama serve");
  }

  const body: any = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false,
  };
  if (system) {
    body.system = system;
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Stream a prompt response from Ollama, returning a ReadableStream compatible
 * with the existing frontend stream reader.
 */
export function streamLocalAI(prompt: string, system?: string): ReadableStream<Uint8Array> {
  console.log("Using local Ollama AI model (streaming)");

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const healthy = await checkOllamaHealth();
        if (!healthy) {
          controller.enqueue(encoder.encode("Error: Local AI server not running. Please start Ollama with: ollama serve"));
          controller.close();
          return;
        }

        const body: any = {
          model: OLLAMA_MODEL,
          prompt,
          stream: true,
        };
        if (system) {
          body.system = system;
        }

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok || !response.body) {
          const errText = await response.text();
          controller.enqueue(encoder.encode(`Error: Ollama returned ${response.status}: ${errText}`));
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          // Ollama streams NDJSON — each line is a JSON object with a "response" field
          const lines = text.split("\n").filter(l => l.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.response) {
                controller.enqueue(encoder.encode(parsed.response));
              }
            } catch {
              // Skip malformed lines
            }
          }
        }

        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(`Error: ${error.message}`));
        controller.close();
      }
    },
  });
}
