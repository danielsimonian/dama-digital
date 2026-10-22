import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Área do cliente — DAMA Digital',
  robots: { index: false, follow: false },
};

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
