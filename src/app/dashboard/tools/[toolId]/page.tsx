"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { allTools } from "@/lib/tool-definitions";
import UploadArea from "@/components/dashboard/UploadArea";
import { ArrowLeft, Sparkles, Send, Loader2, User, FileText } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ToolPage() {
  const { toolId } = useParams();
  const tool = allTools.find((t) => t.id === toolId);
  const router = useRouter();

  // --- STANDARD TOOL STATE ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- AI TOOL STATE ---
  const [fileAttached, setFileAttached] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  // Initialize AI messages based on tool config
  const defaultSysMessage = `Hi there! I am your ${tool?.title}. Upload a document and I will help you with it.`;
  const [messages, setMessages] = useState<Message[]>([
    { id: "sys-1", role: "assistant", content: defaultSysMessage }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!tool) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-heading font-bold text-foreground">Tool not found</h2>
        <button onClick={() => router.push("/dashboard")} className="text-primary hover:underline mt-4 inline-block font-medium">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- STANDARD TOOL LOGIC ---
  let accept: Record<string, string[]> = { "application/pdf": [".pdf"] };
  let maxFiles = 1;
  let maxSizeMB = 50;

  if (toolId === "merge") maxFiles = 20;
  else if (toolId === "jpg-to-pdf") { accept = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }; maxFiles = 20; }
  else if (toolId === "word-to-pdf") accept = { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] };
  else if (toolId === "html-to-pdf") accept = { "text/html": [".html", ".htm"] };

  const handleUpload = async (files: File[]) => {
    setIsProcessing(true);
    setProgress(0);
    setServerError(null);

    const interval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10));
    }, 500);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      
      const res = await fetch(`/api/pdf/${toolId}`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(await res.text() || "Failed to process files");

      const blob = await res.blob();
      let ext = ".pdf";
      if (toolId === "pdf-to-jpg") ext = ".jpg"; 
      if (toolId === "pdf-to-png") ext = ".png";
      if (toolId === "pdf-to-word" || toolId === "pdf-to-ppt" || toolId === "pdf-to-text") ext = ".txt";
      if (toolId === "pdf-to-excel") ext = ".csv"; 
      
      const fileName = `${toolId}-result-${Date.now()}${ext}`;
      setProcessedFileUrl(URL.createObjectURL(blob));
      setProcessedFileName(fileName);
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      let errMsg = "Failed to process files. Please check file sizes or try again later.";
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.error === 'limit_reached') {
          errMsg = parsed.message || "You reached today's limit. Upgrade to Flow or Infinity AI for higher usage.";
        } else if (parsed.error) {
          errMsg = parsed.error;
        }
      } catch (e) {
        if (error.message && error.message.trim() !== "") errMsg = error.message;
      }
      setServerError(errMsg);
      setIsProcessing(false);
      setProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  const handleDownload = () => {
    if (processedFileUrl && processedFileName) {
      const link = document.createElement("a");
      link.href = processedFileUrl;
      link.download = processedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setIsProcessing(false);
    setProgress(0);
    setProcessedFileUrl(null);
    setProcessedFileName(null);
    setServerError(null);
  };

  // Track the uploaded document ID if the AI tool successfully parses it originally
  const [documentId, setDocumentId] = useState<string>("");

  // --- AI TOOL LOGIC ---
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAiLoading(true);
    setServerError(null); // Clear previous errors

    // Wait a moment for UI to settle, then fetch AI
    setTimeout(async () => {
      try {
        // Send followup queries cleanly via JSON
        const res = await fetch(`/api/ai/${toolId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            customPrompt: userMsg.content,
            documentId: documentId || "fallbackContext",
          }),
        });
        
        if (!res.ok) {
          let errMsg = "Failed to communicate with AI.";
          let recommendedPlan: string | undefined;
          try {
             const errData = await res.json();
             if (errData.error === 'limit_reached') {
               errMsg = errData.message || "You reached today's limit. Upgrade to Flow or Infinity AI for higher usage.";
               recommendedPlan = errData.recommended_plan;
             } else {
               errMsg = errData.message || errData.error || errData.details || errMsg;
             }
          } catch(e) {}
          setServerError(errMsg + (recommendedPlan ? ` (Recommended: ${recommendedPlan})` : ''));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");
        const decoder = new TextDecoder();
        const assistantMsgId = (Date.now() + 1).toString();
        
        setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m));
          }
        }
      } catch (error: any) {
        // Fallback for actual network/fetch exceptions down the wire
        setServerError("Failed to communicate with the server. Please check your connection or try again.");
      } finally {
        setAiLoading(false);
      }
    }, 100); // Small delay to allow UI to update
  };

  const handleAiUpload = async (files: File[]) => {
    setAiLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("files", f));
      
      // Store the filename as the documentId for subsequent followups in RAG
      if (files.length > 0) {
        setDocumentId(btoa(files[0].name)); 
      }

      const res = await fetch(`/api/ai/${toolId}`, {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) {
        let errMsg = "Failed to communicate with AI.";
        let recommendedPlan: string | undefined;
        try {
           const errData = await res.json();
           if (errData.error === 'limit_reached') {
             errMsg = errData.message || "You reached today's limit. Upgrade to Flow or Infinity AI for higher usage.";
             recommendedPlan = errData.recommended_plan;
           } else {
             errMsg = errData.message || errData.error || errData.details || errMsg;
           }
        } catch(e) {}
        setServerError(errMsg + (recommendedPlan ? ` (Recommended: ${recommendedPlan})` : ''));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      const assistantMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m));
        }
      }
      setFileAttached(true); 
    } catch (error: any) {
      // Fallback for actual network/fetch exceptions down the wire
      setServerError("Failed to communicate with the server. Please check your connection or try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={clsx("animate-in fade-in duration-500 ease-out", tool.isAi ? "flex flex-col h-[calc(100vh-8rem)]" : "")}>
      <div className="mb-6 shrink-0">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6 bg-white border border-border px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm relative overflow-hidden", tool.isAi ? "bg-violet-50 text-violet-600 border-violet-100" : `bg-white ${tool.color}`)}>
            <tool.icon className={clsx("h-8 w-8", tool.isAi && "relative z-10")} />
            {tool.isAi && <div className="absolute inset-0 bg-violet-400 opacity-20 animate-pulse" />}
          </div>
          <div>
            <h1 className={clsx("text-3xl font-heading font-bold", tool.isAi ? "text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600" : "text-foreground")}>
              {tool.title}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">{tool.desc}</p>
          </div>
        </div>
      </div>

      {tool.isAi ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <div className={clsx("flex flex-col justify-start transition-all duration-700 ease-in-out", fileAttached ? "w-full lg:w-1/3" : "w-full")}>
            {!fileAttached ? (
              <UploadArea 
                onUpload={handleAiUpload}
                accept={{ "application/pdf": [".pdf"] }}
                maxFiles={1}
                isProcessing={aiLoading}
              />
            ) : (
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 h-64">
                <div className="bg-white p-4 rounded-full shadow-sm text-violet-600 relative">
                  <FileText className="h-10 w-10 relative z-10" />
                  <div className="absolute top-0 right-0 -mt-1 -mr-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                  </div>
                </div>
                {/* SERVER ERROR DISPLAY */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col items-center text-center">
              <span className="text-red-700 font-medium">{serverError}</span>
              {serverError.includes("limit") && serverError.includes("Upgrade") && (
                <Link href="/#pricing" className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                  View Upgrade Plans
                </Link>
              )}
            </div>
          )}    </div>
            )}
          </div>

          <div className={clsx("flex flex-col bg-white border border-border rounded-3xl shadow-sm overflow-hidden transition-all duration-700 delay-300", fileAttached ? "w-full lg:w-2/3 h-full opacity-100" : "w-0 opacity-0 hidden")}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((m) => (
                <div key={m.id} className={clsx("flex gap-4 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                  <div className={clsx("w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white shadow-sm", m.role === "user" ? "bg-slate-800" : "bg-gradient-to-br from-violet-600 to-indigo-600")}>
                    {m.role === "user" ? <User className="h-5 w-5" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div className={clsx("px-5 py-4 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm", m.role === "user" ? "bg-slate-100 text-slate-800 rounded-tr-sm" : "bg-gradient-to-br from-violet-50 to-indigo-50/30 text-indigo-950 border border-violet-100/50 rounded-tl-sm")}>
                    {m.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-4 max-w-[85%]">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-violet-50 text-violet-900 border border-violet-100 rounded-tl-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce delay-75" />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce delay-150" />
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-50 border-t border-border mt-auto">
              <form onSubmit={handleAiSubmit} className="relative flex items-center max-w-4xl mx-auto">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={aiLoading || !fileAttached}
                  placeholder={fileAttached ? "Type a customized prompt..." : "Upload a document first..."}
                  className="w-full pl-6 pr-14 py-4 rounded-xl border border-border bg-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow shadow-sm disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || aiLoading || !fileAttached}
                  className="absolute right-2 p-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="h-5 w-5 ml-[2px]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 relative">
          <UploadArea 
            onUpload={handleUpload}
            accept={accept}
            maxFiles={maxFiles}
            maxSizeMB={maxSizeMB}
            isProcessing={isProcessing}
            progress={progress}
            completedFileName={processedFileName || undefined}
            serverError={serverError}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
