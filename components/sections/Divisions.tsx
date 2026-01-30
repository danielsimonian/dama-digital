import Link from 'next/link';
import { Trophy, Code, Music } from 'lucide-react';

export default function Divisions() {
  const divisions = [
    {
      id: 'sports',
      icon: Trophy,
      name: 'DAMA Sports',
      tagline: 'Produção de Eventos Esportivos',
      description: 'Arbitragem, locação de som, troféus, filmagem, fotografia e cobertura completa de eventos esportivos.',
      color: 'from-orange-500 to-red-500',
      hoverColor: 'group-hover:from-orange-400 group-hover:to-red-400',
      textHover: 'group-hover:text-orange-400',
      href: '/sports'
    },
    {
      id: 'tech',
      icon: Code,
      name: 'DAMA Tech',
      tagline: 'Desenvolvimento & Inovação',
      description: 'Websites, sistemas personalizados, apps e soluções tecnológicas para o seu negócio.',
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'group-hover:from-purple-400 group-hover:to-pink-400',
      textHover: 'group-hover:text-purple-400',
      href: '/tech'
    },
    {
      id: 'studio',
      icon: Music,
      name: 'DAMA Studio',
      tagline: 'Produção Musical & Ensino',
      description: 'Aulas de violão e guitarra, gravação, mixagem, masterização e distribuição digital.',
      color: 'from-blue-500 to-cyan-500',
      hoverColor: 'group-hover:from-blue-400 group-hover:to-cyan-400',
      textHover: 'group-hover:text-blue-400',
      href: '/studio'
    }
  ];

  return (
    <section id='divisions' className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-purple-400 font-semibold mb-2 block">NOSSAS DIVISÕES</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Criatividade em 3 Dimensões
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Da quadra ao estúdio, do código à música. A DAMA atua em múltiplas frentes
            para transformar suas ideias em realidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {divisions.map((division) => {
            const Icon = division.icon;
            return (
              <Link key={division.id} href={division.href}>
                <div className="group bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 border border-white/10 hover:border-white/30 transition-all hover:scale-105 cursor-pointer h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${division.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-2 text-white ${division.textHover} transition-colors`}>
                    {division.name}
                  </h3>
                  
                  <p className={`text-sm font-semibold mb-4 ${division.textHover} transition-colors`}>
                    {division.tagline}
                  </p>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {division.description}
                  </p>

                  <div className={`mt-6 flex items-center gap-2 font-semibold group-hover:gap-3 transition-all ${division.textHover}`}>
                    Explorar <span>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}