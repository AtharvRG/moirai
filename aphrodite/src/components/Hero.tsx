'use client'
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Download, Github } from 'lucide-react';
import Threads from './Threads';

export default function Hero() {
  const targetRef = useRef(null);
  const { isMobile } = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  // Parallax for text - reduced range for better performance, disabled on mobile
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], isMobile ? [1, 1] : [1, 0]);

  return (
    <section ref={targetRef} className="relative h-screen w-full flex flex-col justify-between p-4 md:p-12 overflow-hidden border-b border-swiss-black" style={{ willChange: isMobile ? 'auto' : 'transform' }}>

      {/* 1. Background Grid Lines (Behind everything) */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-10 z-0">
        <div className="border-r border-swiss-black h-full"></div>
        <div className="border-r border-swiss-black h-full"></div>
        <div className="border-r border-swiss-black h-full"></div>
      </div>

      {/* 2. WebGL Threads Animation - Disabled on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 opacity-85 mix-blend-multiply">
          <Threads
            color={[0.98, 0.505, 0.07]} // Swiss Orange (rgb(250, 129, 18))
            amplitude={1.2}             // Reduced for better performance
            distance={0}
            enableMouseInteraction={false}
          />
        </div>
      )}

      {/* Mobile background fallback */}
      {isMobile && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-swiss-cream via-swiss-gold to-swiss-orange opacity-10"></div>
      )}

      {/* 3. Content Layer (Must be z-10 to sit above canvas) */}
      <div className="flex justify-between items-start z-10 font-harmond text-xs md:text-sm uppercase tracking-widest pointer-events-none">
        <span>Issue: Intent</span>
        <span className="hidden md:block md:text-2xl">Local-First / Agentic / Narrative</span>
        <span>Dark Mode: <span className="line-through opacity-50">On</span> / <span className="text-swiss-orange">Off</span></span>
      </div>

      {/* 4. Action Buttons (Central area) */}
      <div className="absolute top-[25%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col md:flex-row gap-6 items-center pointer-events-auto">
        <motion.a
          href="https://github.com/AtharvRG/moirai/releases/latest"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-10 py-4 bg-swiss-black text-swiss-cream border-2 border-swiss-black hover:bg-transparent hover:text-swiss-black transition-all duration-500 rounded-sm font-harmond text-xl uppercase tracking-[0.2em] shadow-xl group"
        >
          <Download size={22} className="group-hover:translate-y-0.5 transition-transform" />
          <span>Download</span>
        </motion.a>

        <motion.a
          href="https://github.com/AtharvRG/moirai"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, backgroundColor: "rgb(25, 25, 25)", color: "rgb(250, 243, 225)" }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 px-10 py-4 border-2 border-swiss-black text-swiss-black transition-all duration-500 rounded-sm font-harmond text-xl uppercase tracking-[0.2em] group"
        >
          <Github size={22} className="group-hover:rotate-12 transition-transform" />
          <span>GitHub</span>
        </motion.a>
      </div>

      <motion.div
        style={{
          y,
          opacity,
          willChange: isMobile ? 'auto' : 'transform'
        }}
        className="z-10 mt-auto pointer-events-none"
      >
        {/* Main Title */}
        <h1 className="font-stirus text-[18vw] leading-[0.8] tracking-tighter text-swiss-black mix-blend-darken">
          MOI<span className="italic text-swiss-orange">R</span>AI
        </h1>

        {/* Subtitle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-8">
          <div className="md:col-span-5 md:col-start-8">
            <p className="font-harmond text-xl md:text-3xl leading-tight text-justify-interword bg-swiss-cream p-2 rounded-sm">
              Weaving the thread of daily action into the narrative of life intent. The first Operating System for your soul.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}