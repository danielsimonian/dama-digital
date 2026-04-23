"use client"

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/lib/constants';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const socials = [
  { label: 'Instagram', icon: Instagram, href: socialLinks.instagram, color: 'text-[#E1306C]' },
  { label: 'YouTube', icon: Youtube, href: socialLinks.youtube, color: 'text-[#FF0000]' },
  { label: 'WhatsApp', icon: MessageCircle, href: socialLinks.whatsapp, color: 'text-[#25D366]' },
];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });

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
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass =
    'w-full bg-accent-subtle border border-border focus:border-foreground focus:outline-none ' +
    'text-foreground placeholder:text-foreground-subtle font-body text-base ' +
    'px-4 py-3 rounded-none transition-colors duration-200';

  return (
    <section id="contato" className="py-section bg-background border-t border-border">
      <div className="container mx-auto px-6 lg:px-12" ref={ref}>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Esquerda — info + redes */}
          <motion.div
            className="flex flex-col gap-10"
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={itemVariants}>
              <p className="font-ui text-xs tracking-editorial text-foreground-muted uppercase mb-4">
                Contato
              </p>
              <h2 className="font-display font-black text-4xl lg:text-5xl text-foreground leading-tight tracking-headline">
                Vamos conversar.
              </h2>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col gap-4">
              <p className="font-body text-lg text-foreground-muted leading-relaxed max-w-sm">
                Conta pra gente sobre o seu projeto — respondemos em até 24 horas.
              </p>

              <div className="flex items-center gap-5">
                {socials.map(({ label, icon: Icon, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={label}
                    className={`${color} opacity-70 hover:opacity-100 transition-opacity duration-200`}
                  >
                    <Icon size={26} />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Direita — formulário */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className={inputClass}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
                className={inputClass}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Seu telefone"
                className={inputClass}
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Sobre o seu projeto..."
                rows={5}
                required
                className={inputClass}
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="font-ui text-sm font-medium px-8 py-3 bg-foreground text-background hover:bg-accent hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {status === 'loading' ? 'Enviando...' : 'Enviar mensagem →'}
              </button>

              {status === 'success' && (
                <p className="font-ui text-sm text-foreground-muted border border-border px-4 py-3">
                  Mensagem enviada. Entraremos em contato em breve.
                </p>
              )}

              {status === 'error' && (
                <p className="font-ui text-sm text-foreground-muted border border-border px-4 py-3">
                  Erro ao enviar. Tente novamente.
                </p>
              )}
            </form>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
