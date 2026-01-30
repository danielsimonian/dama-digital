import Link from 'next/link';
import { Music, Mic, Headphones, Radio, GraduationCap, Disc } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'DAMA Studio - Produção Musical & Ensino',
  description: 'Aulas de violão e guitarra, gravação, mixagem, masterização e distribuição digital',
};

export default function DamaStudioPage() {
  const services = [
    { icon: GraduationCap, title: 'Aulas de Música', desc: 'Violão e guitarra para todos os níveis' },
    { icon: Mic, title: 'Gravação', desc: 'Estúdio profissional de áudio' },
    { icon: Headphones, title: 'Mixagem', desc: 'Mix profissional das suas músicas' },
    { icon: Disc, title: 'Masterização', desc: 'Finalização em padrão de mercado' },
    { icon: Radio, title: 'Distribuição Digital', desc: 'Spotify, Apple Music e mais' },
    { icon: Music, title: 'Produção Musical', desc: 'Do conceito ao lançamento' },
  ];

  const artists = [
    { name: 'Artista 1', genre: 'Pop/Rock' },
    { name: 'Artista 2', genre: 'MPB' },
    { name: 'Artista 3', genre: 'Indie' },
  ];

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Header da página */}
        <div className="relative bg-gradient-to-b from-black via-blue-950/20 to-black border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <Music className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    DAMA Studio
                  </h1>
                  <p className="text-xl text-blue-400">Produção Musical & Ensino</p>
                </div>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl">
                Do aprendizado à produção profissional. Aulas de violão e guitarra, 
                gravação, mixagem, masterização e distribuição nas principais plataformas digitais.
              </p>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Nossos <span className="text-blue-400">Serviços</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500 transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

        {/* Artistas/Alunos */}
        <section className="py-24 bg-gradient-to-b from-black via-blue-950/10 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Artistas <span className="text-blue-400">Gravados</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {artists.map((artist, idx) => (
                <div key={idx} className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-8 border border-blue-500/20 hover:border-blue-500 transition-all hover:scale-105">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-center mb-2">{artist.name}</h3>
                  <p className="text-blue-400 text-center text-sm">{artist.genre}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-400 mb-6">Ouça nossos trabalhos no Spotify</p>
              {/* Aqui você pode adicionar players do Spotify embedados */}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-blue-900/50 via-black to-cyan-900/50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para dar vida à sua música?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Agende sua aula experimental ou sessão de gravação
            </p>
            <a href="/#contato" className="inline-block bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 rounded-full font-bold hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 transition-all">
              Entrar em Contato
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}