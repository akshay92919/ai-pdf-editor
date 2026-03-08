import { streamLocalAI } from './localAIService';
import { VectorStore } from './vectorStore';

export class AIProcessor {
  /**
   * Defines which tools require full document context vs targeted RAG retrieval.
   */
  static isRAGTool(toolId: string): boolean {
    const ragTools = ['ai-chat', 'ai-search', 'ai-qa', 'ai-insights', 'ai-study', 'ai-contract'];
    return ragTools.includes(toolId);
  }

  /**
   * Returns highly specific system instructions for 14 different AI tools.
   */
  static getSystemPromptForTool(toolId: string): string {
    switch (toolId) {
      case 'ai-chat':
        return "You are a helpful AI document assistant. Answer the user's questions STRICTLY based on the provided document snippets. If the answer is not in the text, clearly state that you cannot find it.";
      case 'ai-summarize':
        return "You are an expert executive summarizer. Read the entire provided document text and provide a highly concise, structured summary. Highlight the main objective, key findings, and final takeaways.";
      case 'ai-translate':
        return "You are a professional polyglot translator. Translate the document text (or the specific user prompt) into the requested language. Maintain the original professional tone, formatting, and nuances.";
      case 'ai-explain':
        return "You are an expert teacher. Explain the core concepts of the provided document text in simple, easy-to-understand terms suitable for a beginner. Avoid excessive jargon.";
      case 'ai-extract':
        return "Extract ONLY the most crucial data points, facts, and entities from the full document context. Return them as a highly readable bulleted list.";
      case 'ai-notes':
        return "Generate structured study notes from the provided document. Group concepts logically, provide bullet points, and include summary definitions for key terms.";
      case 'ai-qa':
        return "You are an exact answering engine. Answer the user's specific questions using ONLY the provided document snippets. Provide exact quotes where beneficial.";
      case 'ai-search':
        return "You are a semantic search engine. Find all sections in the document snippets that semantically match the user's query. Quote the exact text snippets and explain why they match.";
      case 'ai-insights':
        return "Provide deep analytical insights from the document snippets. What are the underlying implications, sentiment, and latent trends? Don't just summarize; analyze.";
      case 'ai-structured': 
        return "You are a data extraction engine. Extract all key metrics, names, dates, amounts, and quantifiable data into a clean, structured JSON format. Deduce the schema automatically based on the content (e.g., invoices -> total, date, vendor).";
      case 'ai-tags':
        return "Analyze the document context and generate 5 to 10 highly relevant metadata tags or categories. Output them as a simple comma-separated list.";
      case 'ai-contract':
        return "You are a corporate legal analyst. Review these contract snippets. Explicitly list out: 1. Key Obligations, 2. Deadlines/Dates, 3. Payment Terms, 4. Potential Risks/Liabilities.";
      case 'ai-resume':
        return "You are an expert technical recruiter. Analyze this resume text. Extract a bulleted list of: 1. Core Skills, 2. Total Experience (Years), 3. Education, 4. A brief candidate summary score.";
      case 'ai-study':
        return "Create a comprehensive study guide based on the document snippets. Include a glossary of terms, core concepts, and potential quiz questions.";
      default:
        return "You are AI PDF Studio's helpful assistant. Answer questions based on the provided context.";
    }
  }

  /**
   * Executes a Full-Text request (e.g., ai-summarize, ai-translate) using Ollama.
   * Returns a ReadableStream for the frontend.
   */
  static async executeFullTextGeneration(messages: any[], toolId: string, fullText: string): Promise<ReadableStream<Uint8Array>> {
    let systemPrompt = this.getSystemPromptForTool(toolId);
    
    // Safety truncation (Ollama models typically handle 4-8k context, truncate to ~16k chars)
    const MAX_CHARS = 16000; 
    const truncatedContext = fullText.length > MAX_CHARS 
      ? fullText.substring(0, MAX_CHARS) + "\n\n... [Note: Document was truncated due to model context limits.]"
      : fullText;
      
    systemPrompt += `\n\n--- FULL DOCUMENT CONTEXT ---\n${truncatedContext}\n-----------------------------\n\nPlease refer to the document context above.`;

    // Combine messages into a single prompt for Ollama
    const userPrompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    return streamLocalAI(userPrompt, systemPrompt);
  }

  /**
   * Executes a RAG (Retrieval-Augmented Generation) request using Ollama.
   * Finds the most relevant chunks using the vector store for the user's latest query.
   */
  static async executeRAGGeneration(messages: any[], toolId: string, documentId: string): Promise<ReadableStream<Uint8Array>> {
    let systemPrompt = this.getSystemPromptForTool(toolId);
    
    // The query we search against is ideally the user's *latest* message
    const latestUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || "";
    
    // Retrieve top 5 most relevant chunks from the Vector database
    let relevantSnippets = "No relevant document text found.";
    
    if (latestUserMessage) {
       const chunks = await VectorStore.searchSimilarChunks(documentId, latestUserMessage, 5);
       if (chunks && chunks.length > 0) {
         relevantSnippets = chunks.map((c, i) => `[Snippet ${i + 1}]:\n${c.text}`).join("\n\n");
       }
    }

    systemPrompt += `\n\n--- RELEVANT DOCUMENT SNIPPETS ---\n${relevantSnippets}\n----------------------------------\n\nOnly use the snippets above to formulate your answer.`;

    // Combine messages into a single prompt for Ollama
    const userPrompt = messages.map(m => `${m.role}: ${m.content}`).join("\n");

    return streamLocalAI(userPrompt, systemPrompt);
  }
}
