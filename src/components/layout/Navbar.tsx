import Link from "next/link";
import { FileText, Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">
                AI PDF Studio
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/#ai-tools" className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center gap-1">
              AI Tools ✨
            </Link>
            <Link href="/#pdf-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">PDF Tools</Link>
            <Link href="/#conversion-tools" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Conversion Tools</Link>
            <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="/#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-sm">
              Sign Up
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button className="text-muted-foreground hover:text-foreground" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
