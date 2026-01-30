import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="inline-block mb-6 px-6 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
          <span className="text-sm text-gray-300">✨ Sua história merece ser contada</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Criatividade<br/>que Inspira
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto">
          Transformamos ideias em experiências audiovisuais memoráveis. 
          Mais de 10 anos contando histórias através de imagens e som.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => scrollToSection('contato')} className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
            Iniciar Projeto <ArrowRight size={20} />
          </button>
          <button onClick={() => scrollToSection('divisions')} className="border border-white/20 px-8 py-4 rounded-full font-semibold hover:bg-white/5 transition-all">
            Conheça Nosso Trabalho
          </button>
        </div>
      </div>
    </section>
  );
}