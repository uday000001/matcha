"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Leaf, Droplet, ShieldPlus } from "lucide-react";
import HeroCanvas from "@/components/HeroCanvas";

export default function Home() {
  const { scrollYProgress } = useScroll();
  
  // Parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <main className="relative min-h-[200vh] bg-[var(--background)]">
      {/* Fixed Hero Canvas Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <HeroCanvas />
      </div>

      {/* Hero UI Overlay */}
      <section className="relative z-10 min-h-screen flex flex-col justify-between p-8 md:p-16">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex justify-between items-center"
        >
          <div className="text-2xl font-bold tracking-widest text-[#2d3748]">
            URA MATCHA
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-[#2d3748]">
            <a href="#shop" className="hover:text-[var(--color-matcha)] transition-colors">Shop</a>
            <a href="#story" className="hover:text-[var(--color-matcha)] transition-colors">Our Story</a>
            <a href="#recipes" className="hover:text-[var(--color-matcha)] transition-colors">Recipes</a>
          </nav>
          <button className="clay-btn px-6 py-2 font-medium text-sm">
            Cart (0)
          </button>
        </motion.header>

        {/* Hero Content */}
        <motion.div 
          style={{ y: y1, opacity }}
          className="flex flex-col items-center text-center mt-32 md:mt-0"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-xl font-medium tracking-[0.2em] text-[#8C6A4F] mb-6"
          >
            CEREMONIAL GRADE
          </motion.h2>
          
          <div className="mt-8 flex gap-4">
            <button className="clay-btn px-8 py-4 flex items-center gap-2 text-lg font-medium group">
              Order Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="clay-card text-[#2d3748] px-8 py-4 text-lg font-medium hover:bg-white/40 transition-colors">
              Discover Flavor
            </button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity }}
          className="flex flex-col items-center gap-2 mb-8 self-center"
        >
          <span className="text-xs tracking-widest text-[#8C6A4F] uppercase">Scroll</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-[#8C6A4F]/50"
          />
        </motion.div>
      </section>

      {/* Product Cards Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          
          <motion.div 
            style={{ y: y2 }}
            className="clay-card p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-matcha)]/20 flex items-center justify-center mb-6">
              <Leaf className="w-8 h-8 text-[var(--color-matcha)]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#2d3748]">Uji Origin</h3>
            <p className="text-[#8C6A4F]">Shade-grown in the nutrient-rich soils of Uji, Kyoto. Harvested in early spring.</p>
          </motion.div>

          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [0, -150]) }}
            className="clay-card p-8 flex flex-col items-center text-center mt-0 md:mt-12"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-matcha)]/20 flex items-center justify-center mb-6">
              <ShieldPlus className="w-8 h-8 text-[var(--color-matcha)]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#2d3748]">High Antioxidants</h3>
            <p className="text-[#8C6A4F]">Rich in EGCG and L-theanine for sustained, calm energy without the crash.</p>
          </motion.div>

          <motion.div 
            style={{ y: y2 }}
            className="clay-card p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-matcha)]/20 flex items-center justify-center mb-6">
              <Droplet className="w-8 h-8 text-[var(--color-matcha)]" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-[#2d3748]">Organic Ingredients</h3>
            <p className="text-[#8C6A4F]">100% USDA Organic. No pesticides, no artificial additives. Just pure matcha.</p>
          </motion.div>

        </div>
      </section>
    </main>
  );
}
