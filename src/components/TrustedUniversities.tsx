import { motion } from 'framer-motion';
import { GraduationCap, Book, Library, School, Building, Landmark, BookOpen, Crown, Scroll } from 'lucide-react';

const universities = [
  { name: 'MIT', icon: <School className="w-10 h-10" /> },
  { name: 'HARVARD UNIVERSITY', icon: <Landmark className="w-10 h-10" /> },
  { name: 'Stanford University', icon: <Book className="w-10 h-10" /> },
  { name: 'UNIVERSITY OF OXFORD', icon: <Crown className="w-10 h-10" /> },
  { name: 'UNIVERSITY OF CAMBRIDGE', icon: <Building className="w-10 h-10" /> },
  { name: 'Yale University', icon: <Library className="w-10 h-10" /> },
  { name: 'UNIVERSITY OF LAGOS', icon: <GraduationCap className="w-10 h-10" /> },
  { name: 'UNIVERSITY OF NIGERIA', icon: <Scroll className="w-10 h-10" /> },
  { name: 'UNIVERSITY OF IBADAN', icon: <BookOpen className="w-10 h-10" /> },
];

export const TrustedUniversities = () => {
  return (
    <section id="about" className="relative w-full max-w-[1280px] mx-auto px-6 lg:px-8 mt-4 lg:-mt-4 mb-32 z-20">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full rounded-[24px] bg-[#0d1024]/65 backdrop-blur-[20px] border border-white/[0.08] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] py-[28px] px-[40px] overflow-hidden group/container"
      >
        {/* Soft inner glow and subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

        <div className="flex flex-col items-center gap-8 relative z-10">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[#8E97B7] text-[12px] font-bold tracking-[0.2em] uppercase text-center"
          >
            TRUSTED BY STUDENTS WORLDWIDE
          </motion.h3>

          {/* Marquee Container */}
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:[mask-image:none]">
            <div className="flex w-max md:w-full md:justify-center items-center gap-10 md:gap-12 animate-marquee md:animate-none hover:[animation-play-state:paused]">
              {/* Render logos. Duplicate for mobile marquee. */}
              {[...universities, ...universities].map((uni, index) => (
                <motion.div
                  key={`${uni.name}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (index % universities.length) * 0.1, duration: 0.5 }}
                  className={`${index >= universities.length ? 'md:hidden' : ''}`}
                >
                  <div className="flex items-center gap-3 text-secondary-text grayscale hover:text-primary-text hover:grayscale-0 hover:-translate-y-1 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-250 cursor-default" aria-label={uni.name}>
                    <div className="shrink-0">{uni.icon}</div>
                    <span className="font-semibold text-sm whitespace-nowrap tracking-wide">{uni.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
