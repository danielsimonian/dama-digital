"use client"

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const scrollToTop = () => {
  if (pathname !== '/') {
    // Se não estiver na home, redireciona
    window.location.href = '/';
  } else {
    // Se estiver na home, rola para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={scrollToTop} className="flex items-center space-x-2 cursor-pointer">
            <img 
              src="/images/logo.png" 
              alt="DAMA Digital" 
              className="h-12 w-auto"
            />
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={scrollToTop} className="text-gray-300 hover:text-white transition-colors">
              Início
            </button>
            
            <button onClick={() => scrollToSection('sobre')} className="text-gray-300 hover:text-white transition-colors">
              Sobre
            </button>

            <button onClick={() => scrollToSection('portfolio')} className="text-gray-300 hover:text-white transition-colors">
              Portfolio
            </button>
            
            <Link href="/sports" className="text-gray-300 hover:text-orange-400 transition-colors">
              DAMA Sports
            </Link>
            
            <Link href="/tech" className="text-gray-300 hover:text-purple-400 transition-colors">
              DAMA Tech
            </Link>
            
            <Link href="/studio" className="text-gray-300 hover:text-blue-400 transition-colors">
              DAMA Studio
            </Link>
            
            <button onClick={() => scrollToSection('contato')} className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Contato
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <button onClick={scrollToTop} className="block w-full text-left py-2 text-gray-300 hover:text-white">
              Início
            </button>
            
            <button onClick={() => scrollToSection('sobre')} className="block w-full text-left py-2 text-gray-300 hover:text-white">
              Sobre
            </button>
            
            <Link href="/sports" onClick={() => setIsMenuOpen(false)} className="block w-full text-left py-2 text-gray-300 hover:text-orange-400">
              DAMA Sports
            </Link>
            
            <Link href="/tech" onClick={() => setIsMenuOpen(false)} className="block w-full text-left py-2 text-gray-300 hover:text-purple-400">
              DAMA Tech
            </Link>
            
            <Link href="/studio" onClick={() => setIsMenuOpen(false)} className="block w-full text-left py-2 text-gray-300 hover:text-blue-400">
              DAMA Studio
            </Link>

            <button onClick={() => scrollToSection('portfolio')} className="block w-full text-left py-2 text-gray-300 hover:text-white">
              Portfolio
            </button>
            
            <button onClick={() => scrollToSection('contato')} className="block w-full text-left py-2 text-gray-300 hover:text-white">
              Contato
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}