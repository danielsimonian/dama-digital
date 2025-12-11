import { clients } from '@/lib/constants';
import Image from 'next/image';

export default function Portfolio() {
  return (
    <section id="portfolio" className="py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-purple-400 font-semibold mb-2 block">PORTFOLIO</span>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Marcas que Confiam
          </h2>
          <p className="text-xl text-gray-400">
            Orgulho de colaborar com clientes incríveis
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {clients.map((client, index) => (
            <div 
              key={index} 
              className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex items-center justify-center border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group p-6"
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={200}
                height={200}
                className="w-full h-full object-contain rounded-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}