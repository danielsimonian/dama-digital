import Link from 'next/link';
import { Trophy, Camera, Video, Mic2, Users, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'DAMA Sports - Produção de Eventos Esportivos',
  description: 'Arbitragem, locação de som, troféus, filmagem e cobertura completa de eventos esportivos',
};

export default function DamaSportsPage() {
  const services = [
    { icon: Users, title: 'Arbitragem', desc: 'Árbitros qualificados para beach tennis' },
    { icon: Mic2, title: 'Locação de Som', desc: 'Sistema de áudio profissional' },
    { icon: Award, title: 'Troféus & Medalhas', desc: 'Produção personalizada' },
    { icon: Camera, title: 'Fotografia', desc: 'Cobertura fotográfica profissional' },
    { icon: Video, title: 'Filmagem', desc: 'Vídeo e drone para eventos' },
    { icon: Trophy, title: 'Estrutura Completa', desc: 'Treliças, pódio e staff' },
  ];

  const clients = [
    { name: 'ASSESP', logo: '/images/clients/assesp.jpeg' },
    { name: 'RONYMOTORS', logo: '/images/clients/rony.png' },
    { name: 'SPFC', logo: '/images/clients/spfc.png' },
    { name: 'TOMBEACH', logo: '/images/clients/tombeach.png' },
    { name: 'OPENSP', logo: '/images/clients/opensp.webp' },
    { name: 'HYDRA', logo: '/images/clients/hydra.png' },
    { name: 'GENIAL', logo: '/images/clients/genial.png' },
  ];

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Header da página */}
        <div className="relative bg-gradient-to-b from-black via-orange-950/20 to-black border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 py-20 relative z-10">
  <div className="flex flex-col items-center text-center">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/50">
        <Trophy className="w-8 h-8" />
      </div>
      <div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
          DAMA Sports
        </h1>
        <p className="text-xl text-orange-400">Produção de Eventos Esportivos</p>
      </div>
    </div>
    
    <p className="text-xl text-gray-300 max-w-3xl">
      Experiência completa na produção de torneios de beach tennis. 
      Da arbitragem à cobertura audiovisual, cuidamos de cada detalhe para 
      que seu evento seja inesquecível.
    </p>
  </div>
</div>
        </div>

        {/* Serviços */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Nossos <span className="text-orange-400">Serviços</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="group bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 rounded-2xl border border-orange-500/20 hover:border-orange-500 transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                    <p className="text-gray-400">{service.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Clientes */}
        <section className="py-24 bg-gradient-to-b from-black via-orange-950/10 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Eventos que <span className="text-orange-400">Produzimos</span>
            </h2>
            
            <div className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
              {clients.map((client, idx) => (
                <div 
                  key={idx} 
                  className="aspect-square bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 hover:border-orange-500 transition-all cursor-pointer group w-64 h-64 p-8"
                >
                  <img 
                    src={client.logo} 
                    alt={client.name}
                    className="w-full h-full object-contain rounded-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-orange-900/50 via-black to-red-900/50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para realizar seu evento?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Entre em contato e receba um orçamento personalizado
            </p>
            <a href="/#contato" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 rounded-full font-bold hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all">
              Solicitar Orçamento
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}