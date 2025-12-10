"use client"

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
                <img 
                    src="/images/logo.png" 
                    alt="DAMA Digital" 
                    className="h-12 w-auto"
                />
            </div>
          
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('inicio')} className="text-gray-300 hover:text-white transition-colors">Início</button>
              <button onClick={() => scrollToSection('sobre')} className="text-gray-300 hover:text-white transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('servicos')} className="text-gray-300 hover:text-white transition-colors">Serviços</button>
              <button onClick={() => scrollToSection('portfolio')} className="text-gray-300 hover:text-white transition-colors">Portfolio</button>
              <a href="/labs" className="text-gray-300 hover:text-white transition-colors">Labs</a>
              <button onClick={() => scrollToSection('contato')} className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all">
                Contato
              </button>
            </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <button onClick={() => scrollToSection('inicio')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Início</button>
            <button onClick={() => scrollToSection('sobre')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Sobre</button>
            <button onClick={() => scrollToSection('servicos')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Serviços</button>
            <button onClick={() => scrollToSection('portfolio')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Portfolio</button>
            <a href="/labs" className="block w-full text-left py-2 text-gray-300 hover:text-white">Labs</a>
            <button onClick={() => scrollToSection('contato')} className="block w-full text-left py-2 text-gray-300 hover:text-white">Contato</button>
          </div>
        )}
      </nav>
    </header>
  );
}