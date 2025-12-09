"use client"

import { useState, useEffect } from 'react';
import { services } from '@/lib/constants';

export default function Services() {
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveService((prev) => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="servicos" className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-pink-400 font-semibold mb-2 block">NOSSOS SERVIÇOS</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            O Que Fazemos
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index}
                className={`p-8 rounded-2xl border transition-all duration-500 cursor-pointer ${
                  activeService === index 
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500 scale-105' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
                onMouseEnter={() => setActiveService(index)}
              >
                <Icon className={`mb-4 ${activeService === index ? 'text-purple-400' : 'text-gray-400'}`} size={40} />
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-400">{service.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}