import { motion } from 'framer-motion';
import { Hammer } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  description: string;
}

export const PlaceholderView = ({ title, description }: PlaceholderViewProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full w-full py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <div className="w-16 h-16 rounded-2xl bg-card-hover border border-divider flex items-center justify-center mb-6">
          <Hammer className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary-text mb-3">{title}</h2>
        <p className="text-secondary-text text-[15px] leading-relaxed">
          {description}
        </p>
      </motion.div>
    </div>
  );
};
