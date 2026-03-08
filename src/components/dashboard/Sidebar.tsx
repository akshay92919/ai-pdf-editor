"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  FilePlus2,
  Scissors,
  Minimize,
  RefreshCcw,
  Image as ImageIcon
} from "lucide-react";
import { clsx } from "clsx";
import { aiTools, pdfEditingTools, pdfConversionTools, fileOptimizationTools, ToolDefinition } from "@/lib/tool-definitions";

export default function Sidebar() {
  const pathname = usePathname();

  const coreTools = pdfEditingTools.slice(0, 11); // Main editing
  const securityTools = pdfEditingTools.slice(16, 19); // Protect/Unlock/Redact
  const editGroupTools = pdfEditingTools.slice(11, 16); // Text/Highlight/Annotate/Sign/Forms
  const convertTools = pdfConversionTools;

  const renderGroup = (title: string, groupTools: ToolDefinition[]) => (
    <div className="mb-6">
      <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="space-y-1">
        {groupTools.map((item) => {
          const href = `/dashboard/tools/${item.id}`;
          const isActive = pathname === href;
          return (
            <Link
              key={item.id}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              )}
            >
              <item.icon className={clsx("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-64 bg-white border-r border-border flex flex-col h-[calc(100vh-4rem)] sticky top-16 shrink-0 hidden md:flex">
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              pathname === "/dashboard" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-slate-100 hover:text-foreground"
            )}
          >
            <LayoutDashboard className={clsx("h-5 w-5", pathname === "/dashboard" ? "text-primary-foreground" : "text-muted-foreground")} />
            Dashboard Overview
          </Link>
        </div>

        {renderGroup("AI Features ✨", aiTools)}
        {renderGroup("Core Tools", coreTools)}
        {renderGroup("Convert PDF", convertTools)}
        {renderGroup("Optimize", fileOptimizationTools)}
        {renderGroup("Security", securityTools)}
        {renderGroup("Editing", editGroupTools)}
      </div>
      
      <div className="p-4 border-t border-border/50">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground transition-colors mb-2"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Link>
      </div>
    </div>
  );
}
