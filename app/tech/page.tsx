import Link from 'next/link';
import { Code, Smartphone, Database, Zap, Globe, Cpu } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'DAMA Tech - Desenvolvimento & Inovação',
  description: 'Websites, sistemas personalizados, apps e soluções tecnológicas',
};

export default function DamaTechPage() {
  const services = [
    { icon: Globe, title: 'Websites', desc: 'Sites modernos e responsivos' },
    { icon: Smartphone, title: 'Aplicativos', desc: 'Apps web e mobile personalizados' },
    { icon: Database, title: 'Sistemas', desc: 'Soluções completas sob medida' },
    { icon: Cpu, title: 'Automação', desc: 'Otimize processos com tecnologia' },
    { icon: Zap, title: 'Integrações', desc: 'Conecte suas ferramentas' },
    { icon: Code, title: 'Consultoria', desc: 'Planejamento e arquitetura' },
  ];

  const projects = [
    { 
      name: 'Ranking BT', 
      description: 'Plataforma completa de ranking para beach tennis com sistema de pontuação, torneios e estatísticas', 
      link: 'https://www.rankingbt.com.br/',
      logo: '/images/projects/rankingbt.png',
      status: 'live',
      featured: true
    },
    { 
      name: 'ClinUp', 
      description: 'Sistema completo de gestão para clínicas médicas e consultórios nutricionais', 
      link: '#',
      logo: null,
      status: 'development',
      featured: true
    },
  ];

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Header da página */}
        <div className="relative bg-gradient-to-b from-black via-purple-950/20 to-black border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Code className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    DAMA Tech
                  </h1>
                  <p className="text-xl text-purple-400">Desenvolvimento & Inovação</p>
                </div>
              </div>
              
              <p className="text-xl text-gray-300 max-w-3xl">
                Transformamos ideias em soluções digitais. Desenvolvemos websites, 
                sistemas e aplicativos personalizados com tecnologia de ponta.
              </p>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Nossos <span className="text-purple-400">Serviços</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20 hover:border-purple-500 transition-all hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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

        {/* Projetos em Destaque */}
        <section className="py-24 bg-gradient-to-b from-black via-purple-950/10 to-black relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Projetos em <span className="text-purple-400">Destaque</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Soluções completas desenvolvidas para resolver problemas reais
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
              {projects.map((project, idx) => (
                <div key={idx} className="relative">
                  {project.status === 'live' ? (
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500 transition-all hover:scale-105 h-full">
                        <div className="flex items-center justify-between mb-6">
                          <span className="inline-block px-4 py-2 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
                            ● AO VIVO
                          </span>
                        </div>
                        
                        {project.logo && (
                          <div className="mb-6">
                            <img 
                              src={project.logo} 
                              alt={project.name}
                              className="h-16 w-auto object-contain"
                            />
                          </div>
                        )}
                        
                        <h3 className="text-3xl font-bold mb-4 text-white">{project.name}</h3>
                        <p className="text-gray-300 mb-6 text-lg leading-relaxed">{project.description}</p>
                        <div className="text-purple-400 font-semibold flex items-center gap-2 text-lg">
                          Visitar site →
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20 h-full">
                      <div className="flex items-center justify-between mb-6">
                        <span className="inline-block px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/30">
                          ⚡ EM DESENVOLVIMENTO
                        </span>
                      </div>
                      
                      {project.logo && (
                        <div className="mb-6">
                          <img 
                            src={project.logo} 
                            alt={project.name}
                            className="h-16 w-auto object-contain"
                          />
                        </div>
                      )}
                      
                      <h3 className="text-3xl font-bold mb-4 text-white">{project.name}</h3>
                      <p className="text-gray-300 text-lg leading-relaxed">{project.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Link para Labs */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
                <h3 className="text-2xl font-bold mb-4">
                  Conheça o <span className="text-purple-400">DAMA Labs</span>
                </h3>
                <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                  Nosso laboratório de inovação onde desenvolvemos apps experimentais e protótipos
                </p>
                <Link href="/labs" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all">
                  Explorar Labs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-br from-purple-900/50 via-black to-pink-900/50 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Vamos tirar sua ideia do papel?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Entre em contato e vamos conversar sobre seu projeto
            </p>
            <a href="/#contato" className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-bold hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 transition-all">
              Solicitar Orçamento
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}