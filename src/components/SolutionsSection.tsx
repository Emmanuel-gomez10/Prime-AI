import { motion } from 'framer-motion';
import { SectionContainer } from './ui/SectionContainer';
import { AnimatedHeading } from './ui/AnimatedHeading';
import { staggerChildren, fadeUp, fadeLeft, fadeRight } from '../lib/animations';
import { CheckCircle2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const solutions = [
  {
    title: 'Exam Preparation',
    description: 'Comprehensive study guides and mock tests tailored to your specific curriculum and past papers.',
    benefits: ['Predictive question generation', 'Performance analytics', 'Weakness targeting'],
    imageGradient: 'from-purple-500/20 to-blue-500/20',
    align: 'left'
  },
  {
    title: 'Homework Assistance',
    description: 'Stuck on a tough problem? Get step-by-step explanations and conceptual breakdowns, not just the answers.',
    benefits: ['Instant math solving', 'Essay outlining', 'Code debugging'],
    imageGradient: 'from-blue-500/20 to-cyan-500/20',
    align: 'right'
  },
  {
    title: 'Active Recall & Spaced Repetition',
    description: 'Automatically generate flashcards from your notes and review them at optimal intervals for maximum retention.',
    benefits: ['Auto-flashcard creation', 'Smart scheduling', 'Progress tracking'],
    imageGradient: 'from-cyan-500/20 to-emerald-500/20',
    align: 'left'
  }
];

export const SolutionsSection = () => {
  return (
    <SectionContainer id="solutions" className="py-24 relative">
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col gap-24"
      >
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          <AnimatedHeading as="h2">
            Tailored Solutions for <span className="text-gradient">Every Student</span>
          </AnimatedHeading>
          <motion.p variants={fadeUp} className="text-lg text-textSecondary">
            Whether you are cramming for finals or trying to master a complex new topic, Prime AI adapts to your unique learning needs.
          </motion.p>
        </div>

        <div className="flex flex-col gap-16 lg:gap-24 w-full max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <motion.div 
              key={index} 
              variants={fadeUp} 
              className={`flex flex-col ${solution.align === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
            >
              {/* Text Content */}
              <div className="w-full lg:w-1/2 flex flex-col gap-6">
                <h3 className="text-3xl font-bold text-primary-text tracking-tight">{solution.title}</h3>
                <p className="text-lg text-textSecondary leading-relaxed">
                  {solution.description}
                </p>
                <ul className="flex flex-col gap-3 mt-2">
                  {solution.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-primary-text">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual/Image Representation */}
              <div className="w-full lg:w-1/2">
                <GlassCard className="relative overflow-hidden aspect-video flex items-center justify-center border-divider group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.imageGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  
                  {/* Decorative Elements inside the card */}
                  <div className="relative z-10 w-3/4 h-3/4 rounded-xl border border-white/20 bg-card-hover backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <div className="w-16 h-16 rounded-full bg-card-hover mb-4 animate-pulse" />
                      <div className="w-1/2 h-2 rounded-full bg-white/20 mb-2" />
                      <div className="w-1/3 h-2 rounded-full bg-white/20" />
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionContainer>
  );
};
