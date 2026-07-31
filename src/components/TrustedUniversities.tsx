import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Book, Library, School, Building, Landmark, BookOpen, Crown, Scroll, Award } from 'lucide-react';

const universities = [
  { name: 'MIT', icon: <School className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'HARVARD UNIVERSITY', icon: <Landmark className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'Stanford University', icon: <Book className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIVERSITY OF OXFORD', icon: <Crown className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIVERSITY OF CAMBRIDGE', icon: <Building className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIZIK (NAU)', icon: <Award className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'Yale University', icon: <Library className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIVERSITY OF LAGOS', icon: <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIVERSITY OF NIGERIA', icon: <Scroll className="w-8 h-8 sm:w-10 sm:h-10" /> },
  { name: 'UNIVERSITY OF IBADAN', icon: <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" /> },
];

export const TrustedUniversities: React.FC = React.memo(() => {
  return (
    <section id="about" className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-4 lg:-mt-4 mb-20 sm:mb-32 z-20">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full rounded-[20px] sm:rounded-[24px] bg-[#0d1024]/65 border border-white/[0.08] shadow-[0_15px_30px_-15px_rgba(0,0,0,0.6)] py-5 sm:py-[28px] px-4 sm:px-[40px] overflow-hidden group/container gpu-accelerated"
      >
        {/* Soft inner glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[20px] sm:rounded-[24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

        <div className="flex flex-col items-center justify-center text-center gap-6 sm:gap-8 relative z-10 w-full">
          <h3 className="text-[#8E97B7] text-[11px] sm:text-[12px] font-bold tracking-[0.2em] uppercase text-center">
            TRUSTED BY STUDENTS WORLDWIDE
          </h3>

          {/* Horizontally scrollable container on mobile with auto marquee */}
          <div className="w-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex justify-center [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:[mask-image:none]">
            <div className="flex w-max md:w-full md:justify-center items-center gap-8 sm:gap-10 md:gap-12 animate-marquee md:animate-none hover:[animation-play-state:paused] py-1 px-4">
              {/* Render logos */}
              {[...universities, ...universities].map((uni, index) => (
                <div
                  key={`${uni.name}-${index}`}
                  className={`shrink-0 snap-center ${index >= universities.length ? 'md:hidden' : ''}`}
                >
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-secondary-text grayscale hover:text-primary-text hover:grayscale-0 hover:-translate-y-0.5 hover:scale-105 transition-all duration-200 cursor-default min-h-[44px] px-2" aria-label={uni.name}>
                    <div className="shrink-0 text-primary/80 group-hover:text-primary">{uni.icon}</div>
                    <span className="font-semibold text-xs sm:text-sm whitespace-nowrap tracking-wide">{uni.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
});

TrustedUniversities.displayName = 'TrustedUniversities';


