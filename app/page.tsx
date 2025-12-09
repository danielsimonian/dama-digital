"use client"

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Services from '@/components/sections/Services';
import Portfolio from '@/components/sections/Portfolio';
import CTA from '@/components/sections/CTA';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <div className="bg-black text-white">
      <Header />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <CTA />
      <Contact />
      <Footer />
    </div>
  );
}