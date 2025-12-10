import { team } from '@/lib/constants';

export default function About() {
  return (
    <section id="sobre" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-purple-400 font-semibold mb-2 block">SOBRE NÓS</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Paixão por Audiovisual
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Somos um casal que vive e respira audiovisual há mais de uma década
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* Marcella */}
          <div className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all h-full">
              <div className="w-48 h-48 mx-auto mb-6 overflow-hidden rounded-2xl transform rotate-3 hover:rotate-0 transition-transform">
                <img 
                  src="/images/marcella.png" 
                  alt="Marcella Lima"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Marcella Lima</h3>
              <p className="text-purple-400 text-center mb-4 font-semibold">CEO & Filmmaker</p>
              <p className="text-gray-400 text-center leading-relaxed">
                Diretora criativa especializada em storytelling visual. Transforma conceitos em narrativas impactantes que emocionam e engajam audiências.
              </p>
            </div>
          </div>

          {/* Daniel */}
          <div className="group">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all h-full">
              <div className="w-48 h-48 mx-auto mb-6 overflow-hidden rounded-2xl transform -rotate-3 hover:rotate-0 transition-transform">
                <img 
                  src="/images/daniel.png" 
                  alt="Daniel Simonian"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">Daniel Simonian</h3>
              <p className="text-blue-400 text-center mb-4 font-semibold">CEO & Produtor Musical</p>
              <p className="text-gray-400 text-center leading-relaxed">
                Produtor musical com expertise em criação sonora, mixagem e masterização. Cria paisagens sonoras que complementam perfeitamente o visual.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 rounded-2xl border border-white/10 max-w-4xl mx-auto">
          <p className="text-lg text-gray-300 leading-relaxed text-center">
            Passamos por diversos projetos incríveis - desde comerciais e jingles até produções independentes. 
            Acreditamos no poder das imagens e do som para criar experiências que ficam na memória. 
            <span className="text-purple-400 font-semibold"> Cada projeto é uma nova história para contar.</span>
          </p>
        </div>
      </div>
    </section>
  );
}