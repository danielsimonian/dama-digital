import Link from 'next/link';
import Image from 'next/image';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { ArrowUpRight, ChevronRight, Info, CircleCheck, TriangleAlert, CircleX, Loader2 } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export const DIVISAO_LABEL: Record<Divisao, string> = {
  tech: 'DAMA Tech',
  sports: 'DAMA Sports',
  studio: 'DAMA Studio',
};

/* ------------------------------------------------------------------ */
/* Botões                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'bracket' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const buttonBase =
  'ds-press inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none ' +
  'transition-[background-color,color,border-color,opacity] duration-150 ' +
  'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ds-accent text-ds-accent-fg rounded-ds-sm hover:opacity-90',
  secondary: 'border border-ds-line-strong text-ds-fg rounded-ds-sm hover:bg-ds-surface-2 hover:border-ds-muted',
  ghost: 'text-ds-muted rounded-ds-sm hover:text-ds-fg hover:bg-ds-surface-2',
  bracket:
    'font-ds-mono text-ds-fg tracking-wide before:content-["["] after:content-["]"] before:text-ds-subtle after:text-ds-subtle ' +
    'hover:text-ds-accent hover:before:text-ds-accent hover:after:text-ds-accent before:transition-colors after:transition-colors',
  danger: 'bg-ds-danger text-ds-bg rounded-ds-sm hover:opacity-90',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-11 w-11 text-sm',
};

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    buttonBase,
    buttonVariants[variant],
    variant === 'bracket' ? 'h-11 px-1 text-xs gap-2 uppercase' : buttonSizes[size],
    className,
  );
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  divisao?: Divisao;
};

export function Button({ variant, size, loading, divisao, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      data-divisao={divisao}
      className={buttonClass({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" strokeWidth={1.5} aria-hidden />}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  divisao?: Divisao;
};

export function ButtonLink({ variant, size, divisao, className, ...props }: ButtonLinkProps) {
  return <Link data-divisao={divisao} className={buttonClass({ variant, size, className })} {...props} />;
}

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export function UnderlineLink({ className, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        'relative text-ds-fg after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:bg-current',
        'after:origin-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-ds-out',
        'hover:after:origin-left hover:after:scale-x-100 focus-visible:after:scale-x-100',
        className,
      )}
      {...props}
    />
  );
}

export function ArrowLink({ className, children, ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={cn(
        'group inline-flex items-center gap-1.5 text-sm text-ds-fg hover:text-ds-accent transition-colors',
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight
        className="size-4 transition-transform duration-200 ease-ds-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Badges & chips                                                      */
/* ------------------------------------------------------------------ */

export function DivisionBadge({ divisao, className }: { divisao: Divisao; className?: string }) {
  return (
    <span
      data-divisao={divisao}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-ds-xs border border-ds-line px-2 font-ds-mono text-[11px] uppercase tracking-wider text-ds-muted',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-ds-accent" aria-hidden />
      {DIVISAO_LABEL[divisao].replace('DAMA ', '')}
    </span>
  );
}

type Status = 'realizado' | 'proximo' | 'inscricoes' | 'rascunho' | 'erro';

const STATUS: Record<Status, { label: string; className: string }> = {
  realizado: { label: 'Realizado', className: 'text-ds-muted border-ds-line' },
  proximo: { label: 'Próximo', className: 'text-ds-info border-ds-info/40 bg-ds-info-soft' },
  inscricoes: { label: 'Inscrições abertas', className: 'text-ds-success border-ds-success/40 bg-ds-success-soft' },
  rascunho: { label: 'Rascunho', className: 'text-ds-warning border-ds-warning/40 bg-ds-warning-soft' },
  erro: { label: 'Falhou', className: 'text-ds-danger border-ds-danger/40 bg-ds-danger-soft' },
};

export function StatusBadge({ status, children }: { status: Status; children?: ReactNode }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-ds-xs border px-2 font-ds-mono text-[11px] uppercase tracking-wider',
        s.className,
      )}
    >
      {status === 'realizado' && <CircleCheck className="size-3" strokeWidth={1.5} aria-hidden />}
      {status === 'inscricoes' && <span className="size-1.5 rounded-full bg-current animate-pulse" aria-hidden />}
      {children ?? s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const avatarSizes = { sm: 'size-8 text-[11px]', md: 'size-10 text-xs', lg: 'size-14 text-sm' } as const;

export function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string | null;
  name: string;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-ds-line bg-ds-surface-2 font-ds-mono text-ds-muted',
        avatarSizes[size],
        className,
      )}
      title={name}
    >
      {src ? <Image src={src} alt={name} fill sizes="56px" className="object-cover" /> : initials}
    </span>
  );
}

export function AvatarGroup({
  people,
  max = 4,
  size = 'md',
}: {
  people: { name: string; src?: string | null }[];
  max?: number;
  size?: keyof typeof avatarSizes;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p) => (
        <Avatar key={p.name} {...p} size={size} className="ring-2 ring-ds-bg" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full border border-ds-line bg-ds-surface-3 font-ds-mono text-ds-fg ring-2 ring-ds-bg',
            avatarSizes[size],
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estrutura: divisores, anotações, molduras                           */
/* ------------------------------------------------------------------ */

export function Divider({ label, mark, className }: { label?: string; mark?: boolean; className?: string }) {
  if (!label && !mark) return <hr className={cn('border-0 border-t border-ds-line', className)} />;
  return (
    <div className={cn('flex items-center gap-3', className)} role="separator">
      <span className="h-px flex-1 bg-ds-line" />
      {label ? (
        <span className="ds-annot uppercase">{label}</span>
      ) : (
        <span className="relative size-3 text-ds-line-strong" aria-hidden>
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
        </span>
      )}
      <span className="h-px flex-1 bg-ds-line" />
    </div>
  );
}

/** Cota técnica: rótulo mono com linha-guia tracejada. */
export function Annotation({
  children,
  side = 'right',
  length = 48,
  className,
}: {
  children: ReactNode;
  side?: 'left' | 'right';
  length?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', side === 'left' && 'flex-row-reverse', className)}>
      <span className="size-1 rounded-full bg-ds-line-strong" aria-hidden />
      <span className="ds-dashed h-px" style={{ width: length }} aria-hidden />
      <span className="ds-annot">{children}</span>
    </span>
  );
}

export function Eyebrow({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={cn('ds-annot flex items-center gap-3 uppercase', className)}>
      {index && <span className="text-ds-accent">{index}</span>}
      {index && <span className="h-px w-6 bg-ds-line-strong" aria-hidden />}
      <span>{children}</span>
    </p>
  );
}

/** Título em duas linhas: a segunda em cinza. */
export function SplitTitle({
  top,
  bottom,
  as: Tag = 'h2',
  size = 'title',
  className,
}: {
  top: ReactNode;
  bottom?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'title' | 'display' | 'hero';
  className?: string;
}) {
  const sizes = { title: 'text-ds-title', display: 'text-ds-display', hero: 'text-ds-hero' };
  return (
    <Tag className={cn('font-medium text-balance', sizes[size], className)}>
      <span className="block text-ds-fg">{top}</span>
      {bottom && <span className="block text-ds-subtle">{bottom}</span>}
    </Tag>
  );
}

export function Frame({
  children,
  className,
  interactive,
  divisao,
  ...props
}: ComponentPropsWithoutRef<'div'> & { interactive?: boolean; divisao?: Divisao }) {
  return (
    <div
      data-divisao={divisao}
      className={cn(
        'ds-corners relative',
        interactive && 'transition-[background-color] duration-200 hover:[--ds-corner:var(--ds-accent)] hover:bg-ds-surface',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const ALERT: Record<AlertTone, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: 'border-ds-info/40 bg-ds-info-soft [--tone:var(--ds-info)]' },
  success: { icon: CircleCheck, className: 'border-ds-success/40 bg-ds-success-soft [--tone:var(--ds-success)]' },
  warning: { icon: TriangleAlert, className: 'border-ds-warning/40 bg-ds-warning-soft [--tone:var(--ds-warning)]' },
  danger: { icon: CircleX, className: 'border-ds-danger/40 bg-ds-danger-soft [--tone:var(--ds-danger)]' },
};

export function Alert({
  tone = 'info',
  title,
  children,
  action,
}: {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const { icon: Icon, className } = ALERT[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-ds-sm border p-4 text-sm', className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-(--tone)" strokeWidth={1.5} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ds-fg">{title}</p>
        {children && <div className="mt-1 text-ds-muted">{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'rounded-ds-xs bg-ds-surface-2 bg-[linear-gradient(90deg,transparent,var(--ds-surface-3),transparent)] bg-[length:200%_100%] animate-[ds-shimmer_1.6s_linear_infinite]',
        className,
      )}
    />
  );
}

/** Tooltip só com CSS: aparece em hover e foco do gatilho. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap',
          'rounded-ds-xs border border-ds-line bg-ds-surface-3 px-2 py-1 font-ds-mono text-[11px] text-ds-fg opacity-0',
          'transition-[opacity,transform] duration-150 ease-ds-out',
          'group-hover/tt:translate-y-0 group-hover/tt:opacity-100 group-hover/tt:delay-300',
          'group-focus-within/tt:translate-y-0 group-focus-within/tt:opacity-100',
        )}
      >
        {label}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Navegação estática                                                  */
/* ------------------------------------------------------------------ */

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em">
      <ol className="flex flex-wrap items-center gap-1.5 font-ds-mono text-xs text-ds-subtle">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3" strokeWidth={1.5} aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="hover:text-ds-fg transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ds-fg">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Dados                                                               */
/* ------------------------------------------------------------------ */

export function Stat({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="border-t border-ds-line pt-4">
      <p className="text-4xl font-medium tracking-tight tabular-nums text-ds-fg md:text-[3rem]">{value}</p>
      <p className="ds-annot mt-2 uppercase">{label}</p>
      {note && <p className="mt-1 text-xs text-ds-subtle">{note}</p>}
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-ds-xs border border-ds-line bg-ds-surface-2 px-1 font-ds-mono text-[10px] text-ds-muted">
      {children}
    </kbd>
  );
}
