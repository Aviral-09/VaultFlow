import React from 'react';
import { Navbar } from '../components/Navbar';
import { KineticHero } from '../components/KineticHero';
import { InfiniteMarquee } from '../components/InfiniteMarquee';
import { ParallaxCollage } from '../components/ParallaxCollage';
import { StorageCalculator } from '../components/StorageCalculator';
import { ProviderGrid } from '../components/ProviderGrid';
import { Manifesto } from '../components/Manifesto';
import { Footer } from '../components/Footer';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />
      <main className="flex-1">
        <KineticHero />
        <InfiniteMarquee />
        <ParallaxCollage />
        <StorageCalculator />
        <ProviderGrid />
        <Manifesto />
      </main>
      <Footer />
    </div>
  );
};
