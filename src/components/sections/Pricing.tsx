"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: number;
  currencySymbol: string;
  interval: string;
  maxFilesPerDay: number;
  maxFileSizeMB: number;
  aiToolLimits: Record<string, number>;
  adsEnabled: boolean;
  priorityProcessing: boolean;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/subscription/plans");
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-3">Simple Pricing</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Pay for what you need
          </h3>
          <p className="text-lg text-muted-foreground">
            Start for free and upgrade when your team needs more power.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => {
              const popular = plan.id === "flow";
              
              // Custom format features based on backend numbers
              const features = [
                `${plan.maxFilesPerDay} files per day`,
                `Max file size: ${plan.maxFileSizeMB}MB`,
                plan.id === "infinity" ? "Unlimited AI usage" : `Up to ${plan.aiToolLimits["ai-summarize"] || 0} AI Summaries/day`,
                plan.id === "infinity" ? "Unlimited Chat with PDF" : `Up to ${plan.aiToolLimits["ai-chat"] || "0 (Requires Flow)"} Chats/day`,
                plan.adsEnabled ? "Ad-supported" : "No Ads",
                plan.priorityProcessing ? "Priority Processing Queue" : "Standard Processing",
              ].filter(f => !f.includes("0 (Requires Flow)")); // hide 0 features cleanly

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className={`relative bg-white p-8 rounded-3xl border ${popular ? "border-blue-600 shadow-xl ring-1 ring-blue-600/20 scale-105" : "border-slate-200 shadow-sm"} flex flex-col`}
                >
                  {popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h4 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h4>
                    <p className="text-muted-foreground">
                      {plan.id === "spark" ? "Perfect for occasional use." : plan.id === "flow" ? "For daily professionals." : "Ultimate power without limits."}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-heading font-extrabold text-foreground">
                        {plan.price === 0 ? "Free" : `${plan.currencySymbol}${plan.price}`}
                      </span>
                      {plan.interval !== "free" && <span className="text-muted-foreground font-medium">/{plan.interval}</span>}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <ul className="space-y-4 mb-8">
                      {features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-3 text-sm">
                          <div className="bg-blue-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-slate-700 leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    href="/signup" 
                    className={`w-full py-4 rounded-xl flex justify-center items-center font-semibold transition-all ${
                      popular 
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    {plan.price === 0 ? "Start Free" : "Upgrade"}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
