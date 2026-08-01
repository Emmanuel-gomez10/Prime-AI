import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Book, Library, School, Building, Landmark, BookOpen, Crown, Scroll, Award } from 'lucide-react';

const universities = [
  { name: 'MIT', icon: School, color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30' },
  { name: 'HARVARD', icon: Landmark, color: 'from-red-500/20 to-rose-500/20 text-rose-400 border-rose-500/30' },
  { name: 'STANFORD', icon: Book, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
  { name: 'OXFORD', icon: Crown, color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30' },
  { name: 'CAMBRIDGE', icon: Building, color: 'from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'UNIZIK (NAU)', icon: Award, color: 'from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30' },
  { name: 'YALE', icon: Library, color: 'from-blue-600/20 to-sky-600/20 text-sky-400 border-sky-500/30' },
  { name: 'UNILAG', icon: GraduationCap, color: 'from-fuchsia-500/20 to-purple-500/20 text-fuchsia-400 border-fuchsia-500/30' },
  { name: 'UNN', icon: Scroll, color: 'from-emerald-600/20 to-green-600/20 text-emerald-300 border-emerald-500/30' },
  { name: 'UI', icon: BookOpen, color: 'from-amber-600/20 to-orange-600/20 text-orange-400 border-orange-500/30' },
];

export const TrustedUniversities: React.FC = React.memo(() => {
  // Multiply array for seamless infinite marquee scroll
  const marqueeItems = [...universities, ...universities, ...universities];

  return (
    <section id="about" className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-4 lg:-mt-4 mb-20 sm:mb-32 z-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full rounded-[20px] sm:rounded-[24px] bg-[#0d1024]/75 border border-white/[0.1] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] py-6 sm:py-[30px] px-2 sm:px-[40px] overflow-hidden group/container gpu-accelerated"
      >
        {/* Soft inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-[20px] sm:rounded-[24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent" />

        <div className="flex flex-col items-center justify-center text-center gap-6 sm:gap-8 relative z-10 w-full">
          <h3 className="text-[#8E97B7] text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-center">
            TRUSTED BY STUDENTS WORLDWIDE
          </h3>

          {/* Smooth Hardware-Accelerated Animated Marquee + Swipe Container */}
          <div className="w-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex justify-start sm:justify-center [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
            <motion.div 
              className="flex w-max items-center gap-4 sm:gap-6 py-2 px-4 group-hover/container:[animation-play-state:paused]"
              animate={{ x: ['0%', '-33.333%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
            >
              {marqueeItems.map((uni, index) => {
                const IconComponent = uni.icon;
                return (
                  <div
                    key={`${uni.name}-${index}`}
                    className="shrink-0 snap-center"
                  >
                    <div 
                      className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#11142b]/80 border border-white/[0.08] backdrop-blur-md hover:border-white/20 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 cursor-default min-h-[48px] group/item shadow-sm hover:shadow-md" 
                      aria-label={uni.name}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${uni.color} border flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover/item:scale-110`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm text-primary-text/90 group-hover/item:text-white whitespace-nowrap tracking-wide">
                        {uni.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
});

TrustedUniversities.displayName = 'TrustedUniversities';



