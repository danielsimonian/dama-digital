import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAMA Sports — Produção de Eventos de Beach Tennis',
  description: 'Arbitragem, locação de som, troféus, filmagem e cobertura completa de eventos esportivos.',
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
