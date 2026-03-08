"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Layers, Sparkles, FileText, Settings2, FileSpreadsheet, Loader2, Zap } from "lucide-react";
import { aiTools, pdfEditingTools, pdfConversionTools, fileOptimizationTools, ToolDefinition } from "@/lib/tool-definitions";
import { clsx } from "clsx";

export default function DashboardOverview() {
  const [activeTab, setActiveTab] = useState<"ai" | "pdf" | "conversion" | "recent">("ai");
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetch("/api/subscription/current")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSubscription(data);
      })
      .catch(err => console.error("Failed to fetch subscription", err));
  }, []);

  const renderToolGrid = (tools: ToolDefinition[], isPremium = false) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {tools.map((tool, idx) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.03, duration: 0.3 }}
        >
          {isPremium ? (
             <Link 
             href={`/dashboard/tools/${tool.id}`}
             className="block h-full relative group p-[2px] rounded-3xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-blue-500/30 hover:from-violet-500 hover:via-fuchsia-500 hover:to-blue-500 transition-all duration-300"
           >
             <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
             <div className="relative h-full bg-white backdrop-blur-xl border border-white/20 p-6 rounded-[22px] shadow-sm flex flex-col items-start z-10 transition-all">
               <div className="absolute top-4 right-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full shadow-sm">
                 AI Powered
               </div>
               <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 border border-violet-100 bg-violet-50 text-violet-600 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                 <tool.icon className="h-7 w-7" />
               </div>
               <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-indigo-600 transition-colors">{tool.title}</h4>
               <p className="text-sm text-muted-foreground line-clamp-2">
                 {tool.desc}
               </p>
             </div>
           </Link>
          ) : (
            <Link 
              href={`/dashboard/tools/${tool.id}`}
              className="group block h-full bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${tool.color} group-hover:scale-110 transition-transform`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-blue-600 transition-colors">{tool.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tool.desc}
              </p>
            </Link>
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 ease-out">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back. Select a tool to begin.</p>
        </div>
        
        {subscription ? (
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-4 border-r border-slate-200">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                <span className="text-violet-600 font-bold">{subscription.plan.name}</span> Plan
              </p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 rounded-full" 
                    style={{ width: `${Math.min(100, (subscription.usage.filesProcessedToday / subscription.usage.maxFilesPerDay) * 100)}%` }}
                  />
                </div>
                <p className="text-sm font-bold text-foreground">
                  {subscription.usage.filesProcessedToday} / {subscription.usage.maxFilesPerDay}
                </p>
              </div>
            </div>
            <div className="px-4 flex items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Max File Size</p>
                <p className="text-sm font-bold text-foreground">{subscription.usage.maxFileSizeMB} MB</p>
              </div>
              {subscription.plan.id !== "infinity" && (
                <Link href="/#pricing" className="ml-2 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all">
                  <Zap className="w-3 h-3" /> Upgrade
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="h-16 w-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
        )}
      </header>

      {/* TABS */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-border/60 gap-8">
        <button
          onClick={() => setActiveTab("ai")}
          className={clsx(
            "pb-4 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 relative",
            activeTab === "ai" ? "text-violet-600 border-violet-600" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
          )}
        >
          <Sparkles className="h-4 w-4" /> AI Tools ✨
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={clsx(
            "pb-4 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2",
            activeTab === "pdf" ? "text-blue-600 border-blue-600" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
          )}
        >
          <Layers className="h-4 w-4" /> PDF Tools
        </button>
        <button
          onClick={() => setActiveTab("conversion")}
          className={clsx(
            "pb-4 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2",
            activeTab === "conversion" ? "text-emerald-600 border-emerald-600" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
          )}
        >
          <FileSpreadsheet className="h-4 w-4" /> Conversion Tools
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={clsx(
            "pb-4 text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2",
            activeTab === "recent" ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
          )}
        >
          <Clock className="h-4 w-4" /> Recent Files
        </button>
      </div>

      {/* CONTENT SECTIONS */}
      <div className="pt-2">
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div className="mb-6 bg-violet-50 border border-violet-100 p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-violet-800 mb-1">AI Intelligence Suite</h2>
              <p className="text-violet-600 text-sm">Empower your documents with advanced extraction, summarization, and data translation algorithms.</p>
            </div>
            {renderToolGrid(aiTools, true)}
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4 mt-2">Core PDF Editor Workspace</h2>
            {renderToolGrid(pdfEditingTools, false)}
          </div>
        )}

        {activeTab === "conversion" && (
          <div className="space-y-12">
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Format Conversions</h2>
              {renderToolGrid(pdfConversionTools, false)}
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-4">File Optimization</h2>
              {renderToolGrid(fileOptimizationTools, false)}
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Clock className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl text-foreground font-semibold mb-2">No recent files</h3>
              <p className="text-muted-foreground max-w-sm">
                Your processed files will dynamically appear here for quick redownloading and access.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
