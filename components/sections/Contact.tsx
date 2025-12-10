import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/lib/constants';

export default function Contact() {
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
            <div className="space-y-4 mb-8">
              <input 
                type="text" 
                placeholder="Seu nome" 
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <input 
                type="tel" 
                placeholder="Seu telefone" 
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              />
              <textarea 
                placeholder="Conte-nos sobre seu projeto..." 
                rows={5}
                className="w-full bg-black/50 px-6 py-4 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 transition-colors text-white"
              ></textarea>
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all">
                Enviar Mensagem
              </button>
            </div>

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