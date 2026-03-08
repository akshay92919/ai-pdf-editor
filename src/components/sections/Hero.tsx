"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Zap, Shield } from "lucide-react";

export default function Hero() {
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      router.push("/dashboard");
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Zap className="h-4 w-4" />
            <span>Faster, Smarter, Better PDF Tools</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-bold text-foreground tracking-tight mb-6 leading-tight"
          >
            Every PDF tool you need in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">one place</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            AI PDF Studio provides a premium suite of tools to merge, split, compress, and convert your documents securely in the cloud.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-xl mx-auto mt-8 bg-white/70 backdrop-blur-xl border-2 border-dashed border-primary/30 rounded-3xl p-10 shadow-2xl hover:border-primary/60 transition-colors group cursor-pointer relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Click or Drag PDF here</h3>
                <p className="text-muted-foreground text-sm mt-1">Maximum file size 50MB</p>
              </div>
              <input 
                type="file" 
                accept=".pdf" 
                className="hidden" 
                id="heroFileUpload" 
                onChange={handleFileSelect}
              />
              <label 
                htmlFor="heroFileUpload"
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-md font-semibold flex items-center justify-center gap-2"
              >
                Upload PDF
              </label>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            { icon: FileText, title: "100% Free Tier", desc: "Start processing documents instantly without a credit card." },
            { icon: Zap, title: "Lightning Fast", desc: "Powered by modern APIs and edge computing for instant results." },
            { icon: Shield, title: "Bank-grade Security", desc: "Files are automatically deleted after processing." }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/50 border border-slate-100 shadow-sm backdrop-blur-sm">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
