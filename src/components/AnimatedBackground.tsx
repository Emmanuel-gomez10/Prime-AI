import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const AnimatedBackground: React.FC = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 100, mass: 1 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 100, mass: 1 });

  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);
  const parallaxXReverse = useTransform(smoothX, [-0.5, 0.5], [20, -20]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background">
      {/* Soft Noise */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Light Streaks */}
      <motion.div 
        animate={{ x: [0, 1000], opacity: [0, 0.5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[-20%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-[-15deg] blur-[2px]"
      />
      <motion.div 
        animate={{ x: [0, -1000], opacity: [0, 0.3, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute bottom-[30%] right-[-20%] w-[50%] h-[1px] bg-gradient-to-l from-transparent via-primary/20 to-transparent rotate-[10deg] blur-[2px]"
      />

      {/* Gradient Orbs */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px]"
      />
      <motion.div
        style={{ x: parallaxXReverse, y: parallaxY }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/20 blur-[140px]"
      />
    </div>
  );
};
