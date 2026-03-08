"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Cpu, CloudLightning } from "lucide-react";

const features = [
  {
    icon: CloudLightning,
    title: "Instant Processing",
    description: "Our distributed backend ensures your PDFs are processed in mere seconds, regardless of their size."
  },
  {
    icon: Lock,
    title: "Absolute Privacy",
    description: "Your documents never leave our secure servers and are instantly deleted after you download them."
  },
  {
    icon: Cpu,
    title: "Smart Compression",
    description: "Advanced algorithms reduce file size by up to 80% without visible loss of quality."
  },
  {
    icon: CheckCircle2,
    title: "Platform Independent",
    description: "Works seamlessly on Mac, Windows, Linux, iOS, and Android devices directly from your browser."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase text-sm mb-3">Why Choose Us</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Powerful features for professionals
          </h3>
          <p className="text-lg text-muted-foreground">
            We handle the heavy lifting so you can focus on what matters. Your PDFs, perfectly processed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-6"
            >
              <div className="bg-primary/5 p-4 rounded-2xl group-hover:bg-primary/10 group-hover:scale-110 transition-all shrink-0">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-foreground mb-3">{feature.title}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
