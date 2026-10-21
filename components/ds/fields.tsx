import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { ChevronDown, CircleAlert } from 'lucide-react';
import { cn } from './primitives';

const control =
  'w-full rounded-ds-sm border bg-ds-surface px-3 text-sm text-ds-fg placeholder:text-ds-subtle ' +
  'transition-[border-color,background-color] duration-150 outline-none ' +
  'hover:border-ds-line-strong focus-visible:border-ds-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent-soft ' +
  'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-ds-danger';

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  id: string;
  children: ReactNode;
};

function FieldShell({ label, hint, error, optional, id, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm text-ds-fg">
        {label}
        {optional && <span className="ds-annot">opcional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} role="alert" className="flex items-center gap-1.5 text-xs text-ds-danger">
          <CircleAlert className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-msg`} className="text-xs text-ds-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type BaseFieldProps = { label: string; hint?: string; error?: string; optional?: boolean };

export function TextField({
  label,
  hint,
  error,
  optional,
  id,
  className,
  leading,
  ...props
}: BaseFieldProps & ComponentPropsWithoutRef<'input'> & { leading?: ReactNode }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ds-subtle">
            {leading}
          </span>
        )}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
          className={cn(control, 'h-11 border-ds-line', leading ? 'pl-9' : undefined, className)}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  optional,
  id,
  className,
  ...props
}: BaseFieldProps & ComponentPropsWithoutRef<'textarea'>) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
        className={cn(control, 'min-h-28 resize-y border-ds-line py-2.5 leading-relaxed', className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  id,
  className,
  options,
  placeholder,
  ...props
}: BaseFieldProps &
  ComponentPropsWithoutRef<'select'> & { options: { value: string; label: string }[]; placeholder?: string }) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell id={fieldId} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${fieldId}-msg` : undefined}
          className={cn(control, 'h-11 appearance-none border-ds-line pr-9', className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ds-subtle"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

const checkBase =
  'peer appearance-none shrink-0 border border-ds-line-strong bg-ds-surface transition-colors duration-150 ' +
  'checked:border-ds-accent checked:bg-ds-accent hover:border-ds-muted disabled:opacity-40 disabled:cursor-not-allowed';

export function Checkbox({
  label,
  description,
  className,
  ...props
}: ComponentPropsWithoutRef<'input'> & { label: string; description?: string }) {
  return (
    <label className={cn('group flex min-h-11 cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed', className)}>
      <span className="relative mt-0.5 inline-flex">
        <input type="checkbox" className={cn(checkBase, 'size-4 rounded-ds-xs')} {...props} />
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute inset-0 size-4 text-ds-accent-fg opacity-0 peer-checked:opacity-100"
          aria-hidden
        >
          <path d="M4 8.5 6.8 11 12 5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
      <span className="text-sm leading-snug">
        <span className="text-ds-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ds-subtle">{description}</span>}
      </span>
    </label>
  );
}

export function Radio({
  label,
  description,
  className,
  ...props
}: ComponentPropsWithoutRef<'input'> & { label: string; description?: string }) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed', className)}>
      <span className="relative mt-0.5 inline-flex">
        <input type="radio" className={cn(checkBase, 'size-4 rounded-full checked:bg-ds-surface')} {...props} />
        <span className="pointer-events-none absolute inset-1 rounded-full bg-ds-accent opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
      <span className="text-sm leading-snug">
        <span className="text-ds-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ds-subtle">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({
  label,
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<'input'>, 'type'> & { label: string }) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-center justify-between gap-4 has-disabled:cursor-not-allowed', className)}>
      <span className="text-sm text-ds-fg">{label}</span>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          role="switch"
          className={cn(
            'peer h-6 w-10 cursor-pointer appearance-none rounded-full border border-ds-line-strong bg-ds-surface-2',
            'transition-colors duration-150 checked:border-ds-accent checked:bg-ds-accent disabled:cursor-not-allowed disabled:opacity-40',
          )}
          {...props}
        />
        <span
          className={cn(
            'pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-ds-muted',
            'transition-transform duration-200 ease-ds-out peer-checked:translate-x-4 peer-checked:bg-ds-accent-fg',
          )}
        />
      </span>
    </label>
  );
}
