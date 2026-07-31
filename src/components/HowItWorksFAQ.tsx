import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, MessageCircle, GraduationCap, ArrowRight, ChevronDown } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="w-5 h-5 text-blue-400" />,
    num: "1",
    title: "Upload Notes",
    desc: "Upload your lecture notes, PDFs or files."
  },
  {
    icon: <MessageCircle className="w-5 h-5 text-purple-400" />,
    num: "2",
    title: "Ask AI",
    desc: "Ask anything and get instant answers."
  },
  {
    icon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
    num: "3",
    title: "Study Smarter",
    desc: "Understand better and ace every exam."
  }
];

const faqs = [
  { question: "How does Prime AI work?", answer: "Prime AI uses advanced machine learning to analyze your uploaded materials and provide instant, accurate answers and summaries." },
  { question: "Can I upload PDFs and documents?", answer: "Yes, you can upload PDFs, Word documents, PowerPoints, and even images. Prime AI will process them automatically." },
  { question: "Is Prime AI really free?", answer: "We offer a generous free tier that includes unlimited basic usage. For advanced features, we have premium plans available." },
  { question: "Does it work on mobile devices?", answer: "Absolutely! Prime AI is fully responsive and works seamlessly on both iOS and Android devices." },
  { question: "Can AI solve my assignments?", answer: "Prime AI provides step-by-step guidance and explanations to help you understand the concepts and solve assignments yourself." },
  { question: "How secure is my data?", answer: "Your data is encrypted and securely stored. We never share your personal information or uploaded documents with third parties." }
];

export const HowItWorksFAQ: React.FC = React.memo(() => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16">
        
        {/* Left Column: How It Works */}
        <div>
          <h3 className="text-[#8E97B7] text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase mb-6 sm:mb-8">
            How It Works
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
                className="flex-1 flex flex-col items-center text-center p-5 sm:p-6 rounded-[18px] sm:rounded-[20px] bg-[#0c0f1c]/40 border border-divider relative group gpu-accelerated"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card-hover border border-divider flex items-center justify-center mb-3 sm:mb-4 relative shadow-inner">
                  {step.icon}
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-text shadow-lg">
                    {step.num}
                  </div>
                </div>
                <h4 className="text-primary-text font-medium text-[16px] sm:text-[17px] mb-1.5 sm:mb-2">{step.title}</h4>
                <p className="text-secondary-text text-[13px] sm:text-[14px] leading-relaxed">{step.desc}</p>
                
                {/* Arrow to next step */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-primary-text/20">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: FAQ */}
        <div>
          <h3 className="text-[#8E97B7] text-[11px] sm:text-[12px] font-bold tracking-[0.18em] uppercase mb-6 sm:mb-8">
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
               {faqs.map((faq, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                   className="rounded-xl bg-[#0c0f1c]/40 border border-divider cursor-pointer hover:bg-white/[0.03] transition-colors group overflow-hidden min-h-[48px]"
                 >
                   <div className="p-3.5 sm:p-4 flex items-center justify-between min-h-[44px]">
                     <span className="text-primary-text text-[14px] sm:text-[15px] font-medium pr-3">{faq.question}</span>
                     <ChevronDown className={`w-4 h-4 text-secondary-text shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                   </div>
                   <div 
                     className={`overflow-hidden transition-all duration-250 ${openFaq === idx ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}
                   >
                     <p className="px-3.5 sm:px-4 text-secondary-text text-[13px] sm:text-[14px] leading-relaxed">
                       {faq.answer}
                     </p>
                   </div>
                 </div>
               ))}
            </div>
            
            <div className="mt-4 text-center sm:text-right">
              <a href="#faq" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors min-h-[44px] px-2">
                View all questions <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
});

HowItWorksFAQ.displayName = 'HowItWorksFAQ';

