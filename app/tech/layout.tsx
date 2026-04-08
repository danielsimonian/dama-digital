import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DAMA Tech — Software sob medida',
  description: 'Desenvolvimento web, sistemas, aplicativos e automações. Do conceito ao código, do MVP ao produto final.',
};

export default function TechLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
