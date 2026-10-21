'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import type { Divisao } from '@/lib/supabase';
import { cn, Button, Alert, DIVISAO_LABEL } from './primitives';
import { TextField, TextArea, SelectField, Checkbox } from './fields';
import { LINE_ART } from './line-art';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const DIVISOES: { id: Divisao; desc: string; art: keyof typeof LINE_ART }[] = [
  { id: 'tech', desc: 'Site, sistema, app ou automação', art: 'sistemas' },
  { id: 'sports', desc: 'Torneio, transmissão ou cobertura', art: 'torneios' },
  { id: 'studio', desc: 'Produção, mix, master ou aulas', art: 'musica' },
];

type Data = { divisao: Divisao | null; nome: string; email: string; whatsapp: string; mensagem: string; prazo: string; lgpd: boolean };
type Errors = Partial<Record<keyof Data, string>>;
type Status = 'idle' | 'sending' | 'success' | 'error';
export type Briefing = Omit<Data, 'divisao' | 'lgpd'> & { divisao: Divisao; website: string };

const STEPS = ['Divisão', 'Contato', 'Projeto'];

export const PRAZOS = [
  { value: 'urgente', label: 'Menos de 15 dias' },
  { value: '1mes', label: 'Em até 1 mês' },
  { value: '3meses', label: 'De 1 a 3 meses' },
  { value: 'aberto', label: 'Sem pressa' },
];

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 0 && !d.divisao) e.divisao = 'Escolha uma divisão para continuar.';
  if (step === 1) {
    if (d.nome.trim().length < 2) e.nome = 'Como podemos te chamar?';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Confira o e-mail — falta o @ ou o domínio.';
    if (d.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Informe DDD + número, ex.: (13) 99743-4878.';
  }
  if (step === 2) {
    if (d.mensagem.trim().length < 20) e.mensagem = 'Conte um pouco mais (mínimo de 20 caracteres).';
    if (!d.lgpd) e.lgpd = 'Precisamos do seu consentimento para responder.';
  }
  return e;
}

function maskPhone(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 11);
  if (n.length <= 2) return n;
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, n.length - 4)}-${n.slice(-4)}`;
}

/** Formulário de briefing em 3 etapas. Sem `onSubmit` o envio é simulado — `simulateError` força a falha. */
export function ContactForm({
  simulateError = false,
  onSubmit,
}: {
  simulateError?: boolean;
  /** envio real; devolve `true` quando deu certo */
  onSubmit?: (briefing: Briefing) => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Errors>({});
  const [protocol, setProtocol] = useState('');
  const [data, setData] = useState<Data>({ divisao: null, nome: '', email: '', whatsapp: '', mensagem: '', prazo: '', lgpd: false });
  const formRef = useRef<HTMLFormElement>(null);
  const [website, setWebsite] = useState(''); // honeypot contra spam

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const blur = (k: keyof Data) => {
    const e = validate(step, data);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
  };

  const next = () => {
    const e = validate(step, data);
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid]')?.focus());
      return false;
    }
    return true;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!next()) return;
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    setStatus('sending');
    if (onSubmit && data.divisao) {
      const { nome, email, whatsapp, mensagem, prazo, divisao } = data;
      const ok = await onSubmit({ nome, email, whatsapp, mensagem, prazo, divisao, website });
      setStatus(ok ? 'success' : 'error');
      return;
    }
    await new Promise((r) => setTimeout(r, 1400));
    if (!simulateError) setProtocol(`DAMA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`);
    setStatus(simulateError ? 'error' : 'success');
  };

  const reset = () => {
    setStep(0);
    setStatus('idle');
    setProtocol('');
    setErrors({});
    setData({ divisao: null, nome: '', email: '', whatsapp: '', mensagem: '', prazo: '', lgpd: false });
  };

  if (status === 'success') {
    return (
      <div data-divisao={data.divisao ?? undefined} className="ds-corners flex flex-col items-center px-6 py-14 text-center [--ds-corner:var(--ds-accent)]" role="status">
        <CircleCheck className="size-8 text-ds-accent" strokeWidth={1} />
        <h3 className="mt-5 text-2xl font-medium tracking-tight">Briefing recebido, {data.nome.split(' ')[0]}.</h3>
        <p className="mt-2 max-w-sm text-sm text-ds-muted">
          A equipe da {data.divisao && DIVISAO_LABEL[data.divisao]} responde em até 1 dia útil pelo WhatsApp {data.whatsapp}.
        </p>
        {protocol && <p className="ds-annot mt-4">PROTOCOLO · {protocol}</p>}
        <Button variant="bracket" className="mt-6" onClick={reset}>
          Enviar outro briefing
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate data-divisao={data.divisao ?? undefined} className="relative flex flex-col">
      {onSubmit && (
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute -left-[9999px] size-px opacity-0"
        />
      )}
      {/* progresso */}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Etapas">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? 'step' : undefined}>
            <span className={cn('block h-px transition-colors duration-300', i <= step ? 'bg-ds-accent' : 'bg-ds-line')} />
            <span className={cn('ds-annot mt-2 block uppercase', i === step && 'text-ds-fg')}>
              {String(i + 1).padStart(2, '0')} · {label}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, transform: 'translateX(12px)' }}
          animate={{ opacity: 1, transform: 'translateX(0px)' }}
          exit={{ opacity: 0, transform: 'translateX(-8px)', transition: { duration: 0.12 } }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="flex flex-col gap-5"
        >
          {step === 0 && (
            <fieldset>
              <legend className="mb-3 text-sm text-ds-fg">Com qual divisão você quer falar?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {DIVISOES.map((d) => {
                  const on = data.divisao === d.id;
                  return (
                    <label
                      key={d.id}
                      data-divisao={d.id}
                      className={cn(
                        'ds-corners relative flex cursor-pointer flex-col gap-3 p-4 transition-colors',
                        on ? 'bg-ds-accent-soft [--ds-corner:var(--ds-accent)]' : 'hover:bg-ds-surface',
                        'has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-ds-accent',
                      )}
                    >
                      <input
                        type="radio"
                        name="divisao"
                        value={d.id}
                        checked={on}
                        onChange={() => set('divisao', d.id)}
                        data-invalid={errors.divisao ? true : undefined}
                        className="sr-only"
                      />
                      <span className={cn('transition-colors', on ? 'text-ds-accent' : 'text-ds-subtle')}>{LINE_ART[d.art]}</span>
                      <span>
                        <span className="block text-sm font-medium text-ds-fg">{DIVISAO_LABEL[d.id]}</span>
                        <span className="mt-0.5 block text-xs text-ds-muted">{d.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.divisao && (
                <p role="alert" className="mt-2 text-xs text-ds-danger">
                  {errors.divisao}
                </p>
              )}
            </fieldset>
          )}

          {step === 1 && (
            <>
              <TextField label="Nome" autoComplete="name" value={data.nome} onChange={(e) => set('nome', e.target.value)} onBlur={() => blur('nome')} error={errors.nome} placeholder="Como podemos te chamar" />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="E-mail" type="email" autoComplete="email" value={data.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} error={errors.email} placeholder="voce@empresa.com.br" />
                <TextField label="WhatsApp" type="tel" inputMode="tel" autoComplete="tel" value={data.whatsapp} onChange={(e) => set('whatsapp', maskPhone(e.target.value))} onBlur={() => blur('whatsapp')} error={errors.whatsapp} placeholder="(13) 99743-4878" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <TextArea
                label="Sobre o projeto"
                value={data.mensagem}
                onChange={(e) => set('mensagem', e.target.value)}
                onBlur={() => blur('mensagem')}
                error={errors.mensagem}
                hint={`${data.mensagem.length} caracteres`}
                placeholder="Ex.: torneio de beach tennis para 200 atletas em março, com transmissão no YouTube."
              />
              <SelectField
                label="Prazo"
                optional
                value={data.prazo}
                onChange={(e) => set('prazo', e.target.value)}
                placeholder="Selecione"
                options={PRAZOS}
              />
              <div>
                <Checkbox
                  label="Autorizo a DAMA a usar estes dados para responder ao meu contato."
                  checked={data.lgpd}
                  onChange={(e) => set('lgpd', e.target.checked)}
                  aria-invalid={errors.lgpd ? true : undefined}
                />
                {errors.lgpd && (
                  <p role="alert" className="text-xs text-ds-danger">
                    {errors.lgpd}
                  </p>
                )}
              </div>
              {status === 'error' && (
                <Alert tone="danger" title="Não conseguimos enviar agora">
                  Seus dados continuam aqui. Tente de novo em instantes ou chame direto no WhatsApp (13) 99743-4878.
                </Alert>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-ds-line pt-5">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={status === 'sending'}>
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> Voltar
          </Button>
        ) : (
          <span className="ds-annot">leva menos de 1 minuto</span>
        )}
        <Button type="submit" loading={status === 'sending'}>
          {step < 2 ? 'Continuar' : status === 'sending' ? 'Enviando' : status === 'error' ? 'Tentar de novo' : 'Enviar briefing'}
        </Button>
      </div>
    </form>
  );
}
