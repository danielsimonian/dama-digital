"use client"

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Portfolio from '@/components/sections/Portfolio';
import Contact from '@/components/sections/Contact';
import Divisions from '@/components/sections/Divisions';


export default function Home() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <Hero />
      <Divisions />
      <About />
      <Portfolio />
      <Contact />
      <Footer />
    </div>
  );
}