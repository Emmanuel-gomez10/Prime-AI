
import { motion } from 'framer-motion';
import { SectionContainer } from './ui/SectionContainer';
import { AnimatedHeading } from './ui/AnimatedHeading';
import { GlassCard } from './ui/GlassCard';
import { staggerChildren, fadeUp } from '../lib/animations';
import { BookOpen, Brain, Clock, Shield, Sparkles, Zap } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6 text-primary" />,
    title: 'AI-Powered Learning',
    description: 'Personalized study plans adapted to your learning pace and style using advanced machine learning.'
  },
  {
    icon: <Zap className="w-6 h-6 text-accent" />,
    title: 'Instant Feedback',
    description: 'Get immediate corrections and explanations as you practice, reinforcing concepts instantly.'
  },
  {
    icon: <BookOpen className="w-6 h-6 text-secondary" />,
    title: 'Smart Library',
    description: 'Access millions of verified resources and textbooks perfectly matched to your syllabus.'
  },
  {
    icon: <Clock className="w-6 h-6 text-primary" />,
    title: 'Time Optimization',
    description: 'Focus on what matters. Our algorithm highlights areas where you need the most practice.'
  },
  {
    icon: <Shield className="w-6 h-6 text-success" />,
    title: 'Exam Readiness',
    description: 'Track your preparedness with mock tests designed to mimic real examination environments.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-accent" />,
    title: 'Interactive Notes',
    description: 'Transform static textbook pages into interactive flashcards and mind maps automatically.'
  }
];

export const FeaturesSection = () => {
  return (
    <SectionContainer id="features" className="py-24">
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col items-center gap-16"
      >
        <div className="text-center max-w-2xl flex flex-col items-center gap-4">
          <AnimatedHeading as="h2">
            Supercharge Your <span className="text-gradient">Studies</span>
          </AnimatedHeading>
          <motion.p variants={fadeUp} className="text-lg text-textSecondary">
            Prime AI gives you the tools you need to master any subject faster, retain more information, and ace your exams with confidence.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeUp} className="h-full">
              <GlassCard className="h-full flex flex-col gap-4 hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 rounded-xl bg-card-hover border border-divider flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary-text">{feature.title}</h3>
                <p className="text-textSecondary leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionContainer>
  );
};
