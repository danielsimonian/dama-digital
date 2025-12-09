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
          {team.map((member, index) => (
            <div key={index} className="group">
              <div className={`bg-gradient-to-br ${member.gradient === 'from-purple-500 to-pink-500' ? 'from-purple-500/10 to-pink-500/10' : 'from-blue-500/10 to-purple-500/10'} p-8 rounded-2xl border border-white/10 hover:border-${member.gradient === 'from-purple-500 to-pink-500' ? 'purple' : 'blue'}-500/50 transition-all h-full`}>
                <div className={`w-24 h-24 bg-gradient-to-br ${member.gradient} rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-bold`}>
                  {member.initial}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{member.name}</h3>
                <p className={`${member.gradient === 'from-purple-500 to-pink-500' ? 'text-purple-400' : 'text-blue-400'} text-center mb-4 font-semibold`}>{member.role}</p>
                <p className="text-gray-400 text-center leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
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