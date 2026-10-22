import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proposta — DAMA Digital',
  robots: { index: false, follow: false },
};

export default function OrcamentoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
