import type { ReactNode } from 'react';
import { cn } from '@/components/ds/primitives';

export function Section({
  id,
  index,
  title,
  desc,
  children,
}: {
  id: string;
  index: string;
  title: string;
  desc?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-14 border-t border-ds-line px-4 py-14 md:px-8 md:py-20 lg:px-12">
      <header className="mb-10 grid gap-4 md:grid-cols-[5rem_1fr] md:gap-8">
        <p className="ds-annot pt-2 text-ds-accent">{index}</p>
        <div>
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl">{title}</h2>
          {desc && <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ds-muted md:text-base">{desc}</p>}
        </div>
      </header>
      <div className="md:pl-[7rem]">{children}</div>
    </section>
  );
}

export function Specimen({
  label,
  note,
  children,
  className,
  bodyClass,
}: {
  label: string;
  note?: string;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
}) {
  return (
    <div className={cn('min-w-0 border border-ds-line', className)}>
      <div className="flex items-center justify-between gap-4 border-b border-ds-line px-4 py-2.5">
        <span className="shrink-0 font-ds-mono text-[11px] text-ds-fg">{label}</span>
        {note && <span className="ds-annot min-w-0 truncate">{note}</span>}
      </div>
      <div className={cn('p-5 md:p-6', bodyClass)}>{children}</div>
    </div>
  );
}

export function StateLabel({ children }: { children: ReactNode }) {
  return <p className="ds-annot mb-3 uppercase">{children}</p>;
}
