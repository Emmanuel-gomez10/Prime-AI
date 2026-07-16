import { AnimatedBackground } from '../components/AnimatedBackground';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Navbar } from '../components/ui/Navbar';
import { TrustedUniversities } from '../components/TrustedUniversities';
import { FeaturesGrid } from '../components/FeaturesGrid';
import { MidCTA } from '../components/MidCTA';
import { HowItWorksFAQ } from '../components/HowItWorksFAQ';
import { BottomCTA } from '../components/BottomCTA';
import { Footer } from '../components/Footer';
import { SectionContainer } from '../components/ui/SectionContainer';
import { HeroLeft } from '../components/HeroLeft';
import { HeroDashboard } from '../components/HeroDashboard';

export const Home = () => {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -50]);

  return (
    <div className="min-h-screen font-sans text-textPrimary relative selection:bg-primary/30 pt-[80px]">
      <Navbar />
      <AnimatedBackground />

      <div className="relative">
        <SectionContainer className="min-h-[calc(100vh-120px)] flex flex-col justify-center pb-8 lg:pb-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-8 w-full">
            <div className="w-full lg:w-[45%] shrink-0">
              <HeroLeft />
            </div>
            <div className="w-full lg:w-[55%] flex justify-center lg:justify-end">
              <HeroDashboard />
            </div>
          </div>
        </SectionContainer>
      </div>

      <TrustedUniversities />

      <FeaturesGrid />
      <MidCTA />
      <HowItWorksFAQ />
      <BottomCTA />
      <Footer />
    </div>
  );
};
