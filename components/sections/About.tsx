export default function About() {
  return (
    <section id="sobre" className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-purple-400 font-semibold mb-2 block">SOBRE NÓS</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Criatividade que Transforma
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Somos a DAMA Digital: um casal apaixonado por audiovisual há mais de 10 anos
          </p>
        </div>

        {/* Fotos Marcella e Daniel */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mb-16">
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
                Diretora criativa especializada em storytelling visual. Transforma conceitos em narrativas impactantes que emocionam e engajam.
              </p>
            </div>
          </div>

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
                Produtor musical e desenvolvedor. Une tecnologia e criatividade para criar soluções inovadoras e experiências únicas.
              </p>
            </div>
          </div>
        </div>

        {/* Nossa História */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4 text-center">Nossa Jornada</h3>
            <p className="text-lg text-gray-300 leading-relaxed text-center mb-4">
              Há mais de uma década mergulhados no universo audiovisual, construímos a DAMA Digital 
              com um propósito: transformar ideias em experiências memoráveis.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              Do beach tennis ao estúdio, do código à música. Atuamos em três frentes distintas, 
              sempre com o mesmo compromisso: <span className="text-purple-400 font-semibold">qualidade, criatividade e paixão pelo que fazemos.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}