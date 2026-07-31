import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const AnimatedBackground: React.FC = React.memo(() => {
  const [isMobile, setIsMobile] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 100, mass: 1 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 100, mass: 1 });

  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-15, 15]);
  const parallaxXReverse = useTransform(smoothX, [-0.5, 0.5], [15, -15]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        mouseX.set(e.clientX / innerWidth - 0.5);
        mouseY.set(e.clientY / innerHeight - 0.5);
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none transform-gpu">
      {/* Soft Noise - render light opacity SVG grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Light Streaks - only render on desktop */}
      {!isMobile && (
        <>
          <motion.div 
            animate={{ x: [0, 800], opacity: [0, 0.4, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] left-[-20%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-[-15deg] gpu-accelerated"
          />
          <motion.div 
            animate={{ x: [0, -800], opacity: [0, 0.25, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute bottom-[30%] right-[-20%] w-[50%] h-[1px] bg-gradient-to-l from-transparent via-primary/20 to-transparent rotate-[10deg] gpu-accelerated"
          />
        </>
      )}

      {/* Optimized Gradient Orbs - lower blur radius and GPU transform */}
      <motion.div
        style={{ x: isMobile ? 0 : parallaxX, y: isMobile ? 0 : parallaxY }}
        animate={isMobile ? { opacity: 0.25 } : {
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/20 blur-[60px] md:blur-[90px] gpu-accelerated"
      />
      <motion.div
        style={{ x: isMobile ? 0 : parallaxXReverse, y: isMobile ? 0 : parallaxY }}
        animate={isMobile ? { opacity: 0.15 } : {
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-secondary/20 blur-[70px] md:blur-[100px] gpu-accelerated"
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

