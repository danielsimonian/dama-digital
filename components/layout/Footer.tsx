import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import { socialLinks } from '@/lib/constants';

const divisionLinks = [
  { label: 'DAMA Sports', href: '/sports', hover: 'hover:text-sports' },
  { label: 'DAMA Tech', href: '/tech', hover: 'hover:text-tech' },
  { label: 'DAMA Studio', href: '/studio', hover: 'hover:text-studio' },
];

const pageLinks = [
  { label: 'Sobre', href: '/#sobre' },
  { label: 'Clientes', href: '/#portfolio' },
  { label: 'Contato', href: '/#contato' },
];

const socials = [
  { label: 'Instagram', icon: Instagram, href: socialLinks.instagram, color: 'hover:text-[#E1306C]' },
  { label: 'YouTube', icon: Youtube, href: socialLinks.youtube, color: 'hover:text-[#FF0000]' },
  { label: 'WhatsApp', icon: MessageCircle, href: socialLinks.whatsapp, color: 'hover:text-[#25D366]' },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="border-t border-border bg-background">
      <div className="container mx-auto px-6 lg:px-12 py-14">

        {/* Topo — logo + colunas */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-8 lg:gap-16 items-center">

          {/* Logo */}
          <div className="col-span-3 md:col-span-1 flex items-start justify-center">
            <Image
              src="/images/logo.png"
              alt="DAMA Digital"
              width={300}
              height={100}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Divisões */}
          <div className="flex flex-col gap-4">
            <p className="font-ui text-xs tracking-editorial uppercase text-foreground-muted">
              Divisões
            </p>
            <nav className="flex flex-col gap-2.5">
              {divisionLinks.map(({ label, href, hover }) => (
                <Link
                  key={href}
                  href={href}
                  className={`font-ui text-sm text-foreground-subtle transition-colors duration-200 ${hover}`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Navegação */}
          <div className="flex flex-col gap-4">
            <p className="font-ui text-xs tracking-editorial uppercase text-foreground-muted">
              Empresa
            </p>
            <nav className="flex flex-col gap-2.5">
              {pageLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-ui text-sm text-foreground-subtle hover:text-foreground transition-colors duration-200"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Redes */}
          <div className="flex flex-col gap-4">
            <p className="font-ui text-xs tracking-editorial uppercase text-foreground-muted">
              Redes
            </p>
            <div className="flex flex-col gap-2.5">
              {socials.map(({ label, icon: Icon, href, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 font-ui text-sm text-foreground-subtle transition-colors duration-200 ${color}`}
                >
                  <Icon size={15} />
                  {label}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="font-ui text-xs text-foreground-muted">
            © {new Date().getFullYear()} DAMA Digital. Todos os direitos reservados.
          </p>
          <p className="font-ui text-xs text-foreground-subtle">
            Feito com cuidado no Brasil.
          </p>
        </div>

      </div>
    </footer>
  );
}
