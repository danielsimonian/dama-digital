import Link from 'next/link';
import { Beaker, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Labs - DAMA Digital',
  description: 'Projetos experimentais e apps desenvolvidos pela DAMA',
};

export default function LabsPage() {
    const apps = [
      {
        id: 'poker-pay',
        name: 'Poker Pay',
        description: 'Gerenciador completo de torneio de poker com cálculo automático de pagamentos',
        icon: '🎰',
        color: 'from-green-500 to-emerald-500',
        href: '/labs/poker-pay'
      }
    ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-black border-b border-white/10">
        <div className="container mx-auto px-6 py-20">
          <Link href="/" className="text-purple-400 hover:text-purple-300 mb-6 inline-block">
            ← Voltar para o site
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Beaker className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              DAMA Labs
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-2xl">
            Experimentos, protótipos e apps desenvolvidos pela equipe DAMA Digital. 
            Explore nossas criações e inovações.
          </p>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Link key={app.id} href={app.href}>
              <div className="group bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {app.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-purple-400 transition-colors">
                  {app.name}
                </h3>
                <p className="text-gray-400 mb-4">
                  {app.description}
                </p>
                <div className="flex items-center text-purple-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Abrir app <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white/5 rounded-full px-6 py-3 border border-white/10">
            <span className="text-gray-400">🚀 Mais apps em breve...</span>
          </div>
        </div>
      </div>
    </div>
  );
}