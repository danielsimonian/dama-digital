import type { Metadata } from "next";
import { Epilogue, Chivo } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";

const epilogue = Epilogue({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-epilogue",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-chivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DAMA Digital — Criatividade com mais de uma saída",
  description:
    "Agência criativa brasileira com três divisões: DAMA Tech, DAMA Sports e DAMA Studio. Fundada por Daniel Simonian e Marcella Lima.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${epilogue.variable} ${chivo.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
