import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

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
  title: 'Design System — DAMA Digital',
  description: 'Fundamentos, componentes básicos e componentes da DAMA Digital: o manual de campo para o novo site.',
  robots: { index: false, follow: false },
};

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${geist.variable} ${geistMono.variable}`}>{children}</div>;
}
