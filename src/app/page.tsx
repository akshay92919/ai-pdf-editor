import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import ToolsSection from "@/components/sections/ToolsSection";
import Pricing from "@/components/sections/Pricing";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <ToolsSection />
      <Pricing />
    </div>
  );
}
