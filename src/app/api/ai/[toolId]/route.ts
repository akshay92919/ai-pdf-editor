import { PDFExtractor } from "@/services/pdfExtractor";
import { TextChunker } from "@/utils/textChunker";
import { VectorStore } from "@/services/vectorStore";
import { AIProcessor } from "@/services/aiProcessor";
import { checkOllamaHealth } from "@/services/localAIService";
import { UsageService, LimitExceededError } from "@/services/usage.service";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { PlanId } from "@/lib/plans";
import { AI_TOOL_IDS } from "@/lib/plans";

// Max duration for the Vercel edge/lambda function, helpful for large PDFs
export const maxDuration = 60; 
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const resolvedParams = await params;
    const toolId = resolvedParams.toolId;

    if (!AI_TOOL_IDS.includes(toolId)) {
      return new Response(JSON.stringify({ error: "Unknown AI tool" }), { status: 400 });
    }

    // ── Auth & Plan Lookup ──
    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;
    const userRole = session?.user ? (session.user as any).role : "USER";
    
    // Usage tracking only, enforcement is disabled globally
    let userPlan: PlanId = "infinity"; // default to highest tier capability
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

    // ── Payload Parsing ──
    let documentId = "";
    let fullText = "";
    let messages: any[] = [];
    let customPrompt = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];
      
      const rawMessages = formData.get("messages");
      if (rawMessages) messages = JSON.parse(rawMessages as string);

      if (files && files.length > 0) {
        // Enforce file size limits across standard usage tiers
        for (const file of files) {
          UsageService.checkFileSizeLimit(userPlan, file.size, userRole);
        }
        
        // Use filename directly as the documentId for the session, or a hash in prod
        documentId = Buffer.from(files[0].name).toString('base64');

        // Extract native PDF text
        const arrayBuffer = await files[0].arrayBuffer();
        fullText = await PDFExtractor.extractTextFromPDF(arrayBuffer);
        
        // ── RAG Indexing (If Applicable & Not Already Cached) ──
        if (AIProcessor.isRAGTool(toolId) && !VectorStore.isDocumentIndexed(documentId)) {
            // Split into intelligent semantic chunks (1000 - 1500 chars)
            const chunks = TextChunker.chunkText(fullText, documentId);
            
            // Build vectors and store into memory db
            await VectorStore.indexDocumentChunks(documentId, chunks);
        }
        
        // Count as a file processed since we ran heavy extraction
        await UsageService.checkDailyFileCount(userId || "guest", userPlan, files.length, userRole);
        await UsageService.recordFileUsage(userId || "guest", files.length);
      }
    } else {
      // Direct JSON parsing (e.g. follow-up chat loops without re-uploading)
      const body = await req.json();
      messages = body.messages || [];
      documentId = body.documentId || "";
      if (body.customPrompt) customPrompt = body.customPrompt;
    }

    // If pure processing tool (e.g. summarize), we mock a strict system ask.
    if (messages.length === 0 && toolId !== 'ai-chat') {
        messages = [{ role: 'user', content: customPrompt || `Please process this document using the ${toolId} tool.` }];
    }

    let result;
    if (AIProcessor.isRAGTool(toolId)) {
       result = await AIProcessor.executeRAGGeneration(messages, toolId, documentId);
    } else {
       result = await AIProcessor.executeFullTextGeneration(messages, toolId, fullText);
    }

    // Record usage precisely ONLY after stream is successfully initiated
    await UsageService.recordUsage(userId || "guest", toolId);

    return new Response(result, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error: any) {
    console.error(`AI Tool Error [${error?.message || ''}]:`, error);
    
    console.error(`[AI API] Processing Error:`, error);
    return new Response(
      JSON.stringify({ error: "processing_error", message: error.message || "An unexpected error occurred while processing your request." }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
