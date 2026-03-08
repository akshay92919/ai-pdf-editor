import { 
  FilePlus2, Scissors, Minimize, RefreshCcw, FileText, Image as ImageIcon, 
  Trash2, MoveHorizontal, Baseline, Hash, Lock, Unlock, PenTool, Crop, 
  Files, Wrench, FileSpreadsheet, Presentation, LayoutTemplate, Type, 
  Highlighter, MessageSquare, Circle, Stamp, MessageCircle, Bot, Sparkles, Languages,
  FileQuestion, Lightbulb, FileSearch, NotebookPen, Database, Tags, FileSignature, FileBadge, Settings,
  Eraser, ShieldAlert, Search
} from "lucide-react";

export interface ToolDefinition {
  id: string;
  title: string;
  icon: any;
  desc: string;
  color: string;
  isAi?: boolean;
}

export const aiTools: ToolDefinition[] = [
  { id: "ai-chat", title: "Chat with PDF", icon: MessageCircle, desc: "Ask questions and get answers from your document.", color: "bg-blue-50 text-blue-600 border-blue-200", isAi: true },
  { id: "ai-summarize", title: "AI Summarize PDF", icon: Sparkles, desc: "Generate instant executive summaries of your PDF.", color: "bg-violet-50 text-violet-600 border-violet-200", isAi: true },
  { id: "ai-translate", title: "AI Translate PDF", icon: Languages, desc: "Translate your document into over 50 languages.", color: "bg-cyan-50 text-cyan-600 border-cyan-200", isAi: true },
  { id: "ai-explain", title: "AI Explain Document", icon: Lightbulb, desc: "Break down complex documents into simple explanations.", color: "bg-amber-50 text-amber-600 border-amber-200", isAi: true },
  { id: "ai-extract", title: "AI Extract Key Points", icon: Scissors, desc: "Automatically pull out the most important data points.", color: "bg-pink-50 text-pink-600 border-pink-200", isAi: true },
  { id: "ai-notes", title: "AI Generate Notes", icon: NotebookPen, desc: "Create structured notes directly from PDF contents.", color: "bg-emerald-50 text-emerald-600 border-emerald-200", isAi: true },
  { id: "ai-qa", title: "AI Question Answering", icon: FileQuestion, desc: "Directly query your document for specific answers.", color: "bg-indigo-50 text-indigo-600 border-indigo-200", isAi: true },
  { id: "ai-search", title: "AI Smart Search", icon: FileSearch, desc: "Semantically search for concepts inside the PDF.", color: "bg-blue-50 text-blue-500 border-blue-200", isAi: true },
  { id: "ai-insights", title: "AI Document Insights", icon: Bot, desc: "Extract key points, sentiment, and data tables.", color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200", isAi: true },
  { id: "ai-structured", title: "AI to Structured Data", icon: Database, desc: "Convert unstructured PDFs into JSON or CSV data.", color: "bg-teal-50 text-teal-600 border-teal-200", isAi: true },
  { id: "ai-tags", title: "AI Auto Tag", icon: Tags, desc: "Automatically categorize and tag documents.", color: "bg-orange-50 text-orange-600 border-orange-200", isAi: true },
  { id: "ai-contract", title: "AI Contract Analyzer", icon: FileSignature, desc: "Analyze agreements for risks and key clauses.", color: "bg-rose-50 text-rose-600 border-rose-200", isAi: true },
  { id: "ai-resume", title: "AI Resume Analyzer", icon: FileBadge, desc: "Extract candidate skills and score resumes.", color: "bg-purple-50 text-purple-600 border-purple-200", isAi: true },
  { id: "ai-study", title: "AI Study Notes", icon: NotebookPen, desc: "Generate flashcards and study guides from PDFs.", color: "bg-lime-50 text-lime-600 border-lime-200", isAi: true }
];

export const pdfEditingTools: ToolDefinition[] = [
  { id: "merge", title: "Merge PDF", icon: FilePlus2, desc: "Combine multiple PDFs into one unified document.", color: "bg-blue-50 text-blue-600 border-slate-200" },
  { id: "split", title: "Split PDF", icon: Scissors, desc: "Extract pages or split a PDF into smaller files.", color: "bg-orange-50 text-orange-600 border-slate-200" },
  { id: "compress", title: "Compress PDF", icon: Minimize, desc: "Reduce file size without losing quality.", color: "bg-green-50 text-green-600 border-slate-200" },
  { id: "rotate", title: "Rotate PDF", icon: RefreshCcw, desc: "Rotate pages to standard portrait or landscape.", color: "bg-purple-50 text-purple-600 border-slate-200" },
  { id: "delete-pages", title: "Delete Pages", icon: Trash2, desc: "Remove unwanted pages from your document.", color: "bg-red-50 text-red-600 border-slate-200" },
  { id: "reorder", title: "Reorder Pages", icon: MoveHorizontal, desc: "Drag and drop to rearrange your PDF pages.", color: "bg-indigo-50 text-indigo-600 border-slate-200" },
  { id: "extract", title: "Extract Pages", icon: Files, desc: "Pull specific pages out to a new document.", color: "bg-lime-50 text-lime-600 border-slate-200" },
  { id: "page-numbers", title: "Add Page Numbers", icon: Hash, desc: "Insert page numbers seamlessly into your files.", color: "bg-slate-50 text-slate-600 border-slate-200" },
  { id: "watermark", title: "Add Watermark", icon: Baseline, desc: "Stamp an image or text over your document.", color: "bg-cyan-50 text-cyan-600 border-slate-200" },
  { id: "remove-watermark", title: "Remove Watermark", icon: Eraser, desc: "Remove existing watermarks from pages.", color: "bg-zinc-50 text-zinc-600 border-slate-200" },
  { id: "header-footer", title: "Header & Footer", icon: LayoutTemplate, desc: "Add custom headers and footers to your PDF.", color: "bg-sky-50 text-sky-600 border-slate-200" },
  { id: "edit-text", title: "Edit PDF text", icon: Type, desc: "Modify specific text directly within your PDF.", color: "bg-stone-50 text-stone-600 border-slate-200" },
  { id: "highlight", title: "Highlight text", icon: Highlighter, desc: "Highlight important text or sections.", color: "bg-yellow-50 text-yellow-500 border-slate-200" },
  { id: "annotate", title: "Annotate PDF", icon: MessageSquare, desc: "Add notes and annotations to pages.", color: "bg-teal-50 text-teal-600 border-slate-200" },
  { id: "sign", title: "Sign PDF", icon: PenTool, desc: "Add your electronic signature to documents.", color: "bg-sky-50 text-sky-600 border-slate-200" },
  { id: "fill-forms", title: "Fill PDF forms", icon: FileText, desc: "Fill out interactive PDF form fields.", color: "bg-blue-50 text-blue-500 border-slate-200" },
  { id: "protect", title: "Protect PDF", icon: Lock, desc: "Encrypt your file with a secure password.", color: "bg-rose-50 text-rose-600 border-slate-200" },
  { id: "unlock", title: "Unlock PDF", icon: Unlock, desc: "Remove password protection and permissions.", color: "bg-emerald-50 text-emerald-600 border-slate-200" },
  { id: "redact", title: "Redact PDF", icon: ShieldAlert, desc: "Permanently blackout sensitive information.", color: "bg-slate-900 text-white border-slate-700" }
];

export const pdfConversionTools: ToolDefinition[] = [
  { id: "pdf-to-word", title: "PDF to Word", icon: FileText, desc: "Extract text from your PDF into a Word document.", color: "bg-indigo-50 text-indigo-600 border-slate-200" },
  { id: "pdf-to-excel", title: "PDF to Excel", icon: FileSpreadsheet, desc: "Convert PDF tables into Excel sheets.", color: "bg-green-50 text-green-600 border-slate-200" },
  { id: "pdf-to-ppt", title: "PDF to PowerPoint", icon: Presentation, desc: "Turn your PDF into a PowerPoint presentation.", color: "bg-orange-50 text-orange-600 border-slate-200" },
  { id: "pdf-to-jpg", title: "PDF to JPG", icon: ImageIcon, desc: "Extract images or pages as high-quality JPGs.", color: "bg-yellow-50 text-yellow-600 border-slate-200" },
  { id: "pdf-to-png", title: "PDF to PNG", icon: ImageIcon, desc: "Extract images or pages as transparent PNGs.", color: "bg-pink-50 text-pink-600 border-slate-200" },
  { id: "pdf-to-text", title: "PDF to Text", icon: Type, desc: "Extract plain unformatted text from PDF.", color: "bg-slate-50 text-slate-800 border-slate-200" },
  { id: "word-to-pdf", title: "Word to PDF", icon: FileText, desc: "Convert Word documents securely to PDF format.", color: "bg-blue-50 text-blue-600 border-slate-200" },
  { id: "excel-to-pdf", title: "Excel to PDF", icon: FileSpreadsheet, desc: "Convert Excel spreadsheets to PDF format.", color: "bg-emerald-50 text-emerald-600 border-slate-200" },
  { id: "ppt-to-pdf", title: "PowerPoint to PDF", icon: Presentation, desc: "Convert PPT slides securely to PDF format.", color: "bg-amber-50 text-amber-600 border-slate-200" },
  { id: "jpg-to-pdf", title: "JPG to PDF", icon: ImageIcon, desc: "Convert JPG images into a PDF document.", color: "bg-orange-50 text-orange-500 border-slate-200" },
  { id: "png-to-pdf", title: "PNG to PDF", icon: ImageIcon, desc: "Convert PNG images into a PDF document.", color: "bg-rose-50 text-rose-500 border-slate-200" },
  { id: "html-to-pdf", title: "HTML to PDF", icon: LayoutTemplate, desc: "Convert web pages to PDF document.", color: "bg-red-50 text-red-600 border-slate-200" }
];

export const fileOptimizationTools: ToolDefinition[] = [
  { id: "compress-pdf", title: "Compress PDF", icon: Minimize, desc: "Reduce file size heavily without losing quality.", color: "bg-green-50 text-green-600 border-slate-200" },
  { id: "repair", title: "Repair PDF", icon: Wrench, desc: "Fix corrupted or broken PDF files.", color: "bg-fuchsia-50 text-fuchsia-600 border-slate-200" },
  { id: "reduce-size", title: "Reduce PDF Size", icon: Minimize, desc: "Optimize PDF specifically for email attachments.", color: "bg-teal-50 text-teal-600 border-slate-200" },
  { id: "optimize-web", title: "Optimize for Web", icon: Settings, desc: "Linearize PDF for fast web view streaming.", color: "bg-sky-50 text-sky-600 border-slate-200" },
  { id: "ocr-pdf", title: "OCR PDF", icon: Search, desc: "Extract text from scanned documents using OCR.", color: "bg-violet-50 text-violet-600 border-slate-200" }
];

export const allTools = [
  ...aiTools,
  ...pdfEditingTools,
  ...pdfConversionTools,
  ...fileOptimizationTools
];
