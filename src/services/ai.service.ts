import { streamLocalAI, runLocalAI } from '@/services/localAIService';
import { PDFParse } from 'pdf-parse';

export class AIService {
  
  static async extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
    try {
      const parser = new PDFParse({ data: Buffer.from(fileBuffer) });
      const data = await parser.getText();
      await parser.destroy();
      return data.text;
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      throw new Error("Could not parse text from the uploaded PDF document.");
    }
  }

  static getSystemPromptForTool(toolId: string): string {
    switch (toolId) {
      case 'ai-summarize':
        return "You are an expert document summarizer. Give a concise, structured summary of the provided text. Highlight main points and key takeaways.";
      case 'ai-translate':
        return "You are a professional translator. Translate the provided text while maintaining the original tone and context. If no language is specified, translate to English.";
      case 'ai-explain':
        return "You are a teacher. Explain the concepts in the provided document in simple, easy-to-understand terms suitable for a beginner.";
      case 'ai-extract':
        return "Extract only the absolute most crucial data points, entities, or facts from the text. Return them as a bulleted list.";
      case 'ai-notes':
        return "Generate structured study notes from the provided text. Group concepts logically and provide summary definitions for key terms.";
      case 'ai-chat':
      case 'ai-qa':
        return "You are a helpful AI assistant answering questions STRICTLY based on the provided document context. If the answer is not in the text, state so clearly.";
      case 'ai-insights':
        return "Provide deep insights, trends, or underlying implications found in the provided document. Don't just summarize; analyze the meaning.";
      case 'ai-structured-data':
        return "Extract key information into a structured JSON format. Deduce the schema based on the document's content (e.g., invoices -> total, date, vendor).";
      case 'ai-autotag':
        return "Suggest 5-10 highly relevant tags or categories for this document. Output them as a comma-separated list.";
      case 'ai-contract':
        return "You are a legal analyst. Review this contract text. Highlight key obligations, deadlines, liabilities, and potential risks.";
      case 'ai-resume':
        return "You are an HR recruiter. Analyze this resume. List key skills, experience level, strong points, and areas that might need clarification.";
      default:
        return "You are a helpful AI assistant. Answer questions based on the provided document.";
    }
  }

  static async streamChatResponse(messages: any[], toolId: string, documentContext?: string) {
    let systemPrompt = this.getSystemPromptForTool(toolId);
    
    if (documentContext) {
      const MAX_CONTEXT_LENGTH = 12000;
      const truncatedContext = documentContext.length > MAX_CONTEXT_LENGTH 
        ? documentContext.substring(0, MAX_CONTEXT_LENGTH) + "... [content truncated]"
        : documentContext;
        
      systemPrompt += `\n\n--- DOCUMENT CONTEXT ---\n${truncatedContext}\n------------------------\n\nPlease refer to the document context above to answer the user's queries.`;
    }

    const userPrompt = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    return streamLocalAI(userPrompt, systemPrompt);
  }
}
