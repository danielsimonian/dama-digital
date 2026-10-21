import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { PainelShell } from './_components/PainelShell';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Painel — DAMA Digital',
  robots: { index: false, follow: false },
};

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} ${geistMono.variable}`}>
      <PainelShell>{children}</PainelShell>
    </div>
  );
}
