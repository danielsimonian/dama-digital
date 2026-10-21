'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { cn } from './primitives';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export type GalleryItem = { src: string; alt: string; portrait?: boolean };

export function Gallery({ items, caption }: { items: GalleryItem[]; caption?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (dir: number) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [index, close, go]);

  const current = index !== null ? items[index] : null;

  return (
    <>
      <div className="grid auto-rows-[9rem] grid-flow-dense grid-cols-2 gap-2 md:auto-rows-[12rem] md:grid-cols-4">
        {items.map((item, i) => (
          <button
            key={item.src}
            onClick={() => setIndex(i)}
            className={cn(
              'group relative overflow-hidden border border-ds-line bg-ds-surface-2',
              item.portrait ? 'row-span-2' : i % 5 === 1 ? 'col-span-2' : '',
            )}
            aria-label={`Ampliar foto ${i + 1}: ${item.alt}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover grayscale-[0.6] transition-[filter,transform] duration-500 ease-ds-out group-hover:scale-[1.03] group-hover:grayscale-0"
            />
            <span className="ds-annot absolute bottom-2 left-2 rounded-ds-xs bg-ds-bg/80 px-1.5 py-0.5 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              {String(i + 1).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visualização da foto"
            className="fixed inset-0 z-[100] flex flex-col bg-[oklch(8%_0_0/0.96)] text-[oklch(94%_0_0)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
              <span className="font-ds-mono text-xs tabular-nums text-[oklch(70%_0_0)]">
                {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                {caption && <span className="ml-3 hidden sm:inline">· {caption}</span>}
              </span>
              <button onClick={close} aria-label="Fechar" className="inline-flex size-11 items-center justify-center hover:opacity-70">
                <X className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.src}
                  className="absolute inset-4 md:inset-x-20 md:inset-y-4"
                  initial={{ opacity: 0, transform: 'scale(0.98)' }}
                  animate={{ opacity: 1, transform: 'scale(1)' }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button
                onClick={() => go(-1)}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center border border-[oklch(40%_0_0)] bg-[oklch(12%_0_0/0.6)] hover:bg-[oklch(20%_0_0)]"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Próxima foto"
                className="absolute right-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center border border-[oklch(40%_0_0)] bg-[oklch(12%_0_0/0.6)] hover:bg-[oklch(20%_0_0)]"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="px-4 py-4 text-center font-ds-mono text-xs text-[oklch(70%_0_0)] md:px-6">{current.alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function VideoFrame({
  src,
  poster,
  title,
  duration,
  meta,
}: {
  src: string;
  poster: string;
  title: string;
  duration?: string;
  meta?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure>
      <div className="ds-corners relative aspect-video overflow-hidden bg-ds-surface-2 p-1 [--ds-corner-size:16px]">
        <div className="relative h-full w-full overflow-hidden">
          {playing ? (
            <video src={src} poster={poster} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />
          ) : (
            <button onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Reproduzir: ${title}`}>
              <Image src={poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover grayscale-[0.4] transition-[filter] duration-500 group-hover:grayscale-0" />
              <span className="absolute inset-0 bg-gradient-to-t from-[oklch(10%_0_0/0.7)] to-transparent" />
              <span className="absolute left-1/2 top-1/2 inline-flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[oklch(100%_0_0/0.6)] text-[oklch(100%_0_0)] backdrop-blur-sm transition-transform duration-200 ease-ds-out group-hover:scale-105 group-active:scale-95">
                <Play className="ml-0.5 size-5" strokeWidth={1.5} fill="currentColor" />
              </span>
              <span className="absolute bottom-3 left-3 font-ds-mono text-[11px] uppercase tracking-wider text-[oklch(100%_0_0/0.85)]">
                Reel {duration && `· ${duration}`}
              </span>
            </button>
          )}
        </div>
      </div>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4">
        <span className="text-sm text-ds-fg">{title}</span>
        {meta && <span className="ds-annot">{meta}</span>}
      </figcaption>
    </figure>
  );
}
