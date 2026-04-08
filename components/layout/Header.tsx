"use client"

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    if (pathname !== '/') {
      window.location.href = '/';
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        footerVisible ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      } ${
        scrolled
          ? 'bg-background/95 backdrop-blur-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-12 py-5">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <button onClick={scrollToTop} className="cursor-pointer shrink-0">
            <Image
              src="/images/logo.png"
              alt="DAMA Digital"
              width={140}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            <button
              onClick={() => scrollToSection('sobre')}
              className="cursor-pointer font-ui text-sm text-foreground-muted hover:text-foreground transition-colors duration-200"
            >
              Sobre
            </button>

            <button
              onClick={() => scrollToSection('portfolio')}
              className="cursor-pointer font-ui text-sm text-foreground-muted hover:text-foreground transition-colors duration-200"
            >
              Clientes
            </button>

            <Link
              href="/sports"
              className="font-ui text-sm text-foreground-muted hover:text-sports transition-colors duration-200"
            >
              DAMA Sports
            </Link>

            <Link
              href="/tech"
              className="font-ui text-sm text-foreground-muted hover:text-tech transition-colors duration-200"
            >
              DAMA Tech
            </Link>

            <Link
              href="/studio"
              className="font-ui text-sm text-foreground-muted hover:text-studio transition-colors duration-200"
            >
              DAMA Studio
            </Link>

            <button
              onClick={() => scrollToSection('contato')}
              className="cursor-pointer font-ui text-sm px-5 py-2 bg-foreground text-background hover:bg-accent transition-colors duration-200"
            >
              Contato
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground p-1"
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 pb-2 border-t border-border space-y-0.5">
            <button
              onClick={() => scrollToSection('sobre')}
              className="cursor-pointer block w-full text-left py-2.5 font-ui text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Sobre
            </button>

            <button
              onClick={() => scrollToSection('portfolio')}
              className="cursor-pointer block w-full text-left py-2.5 font-ui text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Clientes
            </button>

            <Link
              href="/sports"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 font-ui text-sm text-foreground-muted hover:text-sports transition-colors"
            >
              DAMA Sports
            </Link>

            <Link
              href="/tech"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 font-ui text-sm text-foreground-muted hover:text-tech transition-colors"
            >
              DAMA Tech
            </Link>

            <Link
              href="/studio"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 font-ui text-sm text-foreground-muted hover:text-studio transition-colors"
            >
              DAMA Studio
            </Link>

            <button
              onClick={() => scrollToSection('contato')}
              className="cursor-pointer block w-full text-left py-2.5 font-ui text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Contato
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
