"use client"

import { useState } from 'react';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/lib/constants';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contato" className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-pink-400 font-semibold mb-2 block">CONTATO</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Vamos Conversar?
          </h2>
          <p className="text-xl text-gray-400">
            Como podemos te ajudar hoje? 😉
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-white/10 p-8 md:p-12 rounded-2xl border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome" 
                required
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Seu e-mail" 
                required
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Seu telefone" 
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Conte-nos sobre seu projeto..." 
                rows={5}
                required
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              ></textarea>
              
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
              </button>

              {status === 'success' && (
                <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-xl text-center">
                  ✅ Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-center">
                  ❌ Erro ao enviar mensagem. Tente novamente.
                </div>
              )}
            </form>

            <div className="flex justify-center space-x-4">
              <a 
                href={socialLinks.instagram} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href={socialLinks.youtube} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
              <a 
                href={socialLinks.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}