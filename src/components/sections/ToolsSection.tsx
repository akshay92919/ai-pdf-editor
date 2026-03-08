"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { aiTools, pdfEditingTools, pdfConversionTools, fileOptimizationTools, ToolDefinition } from "@/lib/tool-definitions";

export default function ToolsSection() {
  const renderPremiumGrid = (tools: ToolDefinition[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tools.map((tool, idx) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05, duration: 0.4 }}
        >
          <Link 
            href={`/dashboard/tools/${tool.id}`}
            className="block h-full relative group p-[2px] rounded-3xl bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-blue-500/30 hover:from-violet-500 hover:via-fuchsia-500 hover:to-blue-500 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative h-full bg-white/95 backdrop-blur-xl border border-white/20 p-6 rounded-[22px] shadow-sm flex flex-col items-start z-10 transition-all">
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
        </motion.div>
      ))}
    </div>
  );

  const renderStandardGrid = (tools: ToolDefinition[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {tools.map((tool, idx) => (
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.03, duration: 0.3 }}
        >
          <Link 
            href={`/dashboard/tools/${tool.id}`}
            className="block h-full bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 border ${tool.color} group-hover:scale-110 transition-transform`}>
              <tool.icon className="h-7 w-7" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">{tool.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.desc}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-50/50">
      {/* AI Tools Section */}
      <section id="ai-tools" className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-violet-100/40 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-violet-600 font-semibold tracking-wide uppercase text-sm mb-3">Next Generation</h2>
            <h3 className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 mb-4">
              AI Document Intelligence
            </h3>
            <p className="text-lg text-muted-foreground">
              Analyze, translate, and extract insights from your PDFs automatically using advanced artificial intelligence.
            </p>
          </div>
          {renderPremiumGrid(aiTools)}
        </div>
      </section>

      {/* Standard PDF Tools Section */}
      <section id="pdf-tools" className="py-24 bg-white relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-slate-600 font-semibold tracking-wide uppercase text-sm mb-3">Essential Toolkit</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Standard PDF Tools
            </h3>
            <p className="text-lg text-muted-foreground">
              Merge, edit, annotate, and secure your PDF documents seamlessly.
            </p>
          </div>
          {renderStandardGrid(pdfEditingTools)}
        </div>
      </section>

      {/* Conversion Tools Section */}
      <section id="conversion-tools" className="py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              PDF Conversion
            </h3>
            <p className="text-lg text-muted-foreground">
              Convert documents to and from PDF format with full fidelity.
            </p>
          </div>
          {renderStandardGrid(pdfConversionTools)}
          
          <div className="mt-24 mb-12 border-t border-slate-200 pt-16">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
              File Optimization
            </h3>
            <p className="text-lg text-muted-foreground mb-10">
              Compress, repair, and optimize documents for web and sharing.
            </p>
            {renderStandardGrid(fileOptimizationTools)}
          </div>
        </div>
      </section>
    </div>
  );
}
