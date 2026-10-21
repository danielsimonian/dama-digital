import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SitePage, ContactSection } from '@/components/ds/page';
import { Reveal } from '@/components/ds/reveal';
import { Eyebrow, SplitTitle } from '@/components/ds/primitives';
import { studioArtists, studioReleases } from '@/lib/site-data';
import { Catalogo } from './_components/Catalogo';

export const metadata: Metadata = {
  title: 'Artistas e lançamentos — DAMA Studio',
  description: `${studioArtists.length} artistas e ${studioReleases.length} lançamentos produzidos na DAMA Studio.`,
};

export default function ArtistasPage() {
  return (
    <SitePage current="/studio" divisao="studio">
      <section className="border-b border-ds-line">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
          <Link href="/studio" className="ds-annot inline-flex min-h-11 items-center gap-2 uppercase hover:text-ds-fg">
            <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden /> DAMA Studio
          </Link>
          <Reveal className="mt-6">
            <Eyebrow index="00">Portfólio</Eyebrow>
            <SplitTitle as="h1" size="display" top="Artistas e lançamentos" bottom="tudo que saiu do estúdio" className="mt-6" />
            <p className="ds-annot mt-6">
              {studioArtists.length} artistas · {studioReleases.length} lançamentos · {studioReleases[studioReleases.length - 1].year}–
              {studioReleases[0].year}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-ds-line">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8">
          <Catalogo />
        </div>
      </section>

      <ContactSection index="01" divisao="studio" top="Quer lançar a sua música?" bottom="da gravação à playlist" />
    </SitePage>
  );
}
