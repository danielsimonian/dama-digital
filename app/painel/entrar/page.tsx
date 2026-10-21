'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Alert, Button } from '@/components/ds/primitives';
import { TextField } from '@/components/ds/fields';
import { DamaLogo } from '@/components/ds/site';

export default function EntrarPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!authLoading && user) router.replace('/painel');
  }, [authLoading, user, router]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    const { error } = await signIn(email, senha);
    if (error) {
      setErro('E-mail ou senha inválidos.');
      setEnviando(false);
    } else {
      router.replace('/painel');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ds-subtle" strokeWidth={1.5} aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="ds-grid-bg flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={entrar} className="ds-corners w-full max-w-sm border border-ds-line bg-ds-surface p-6 [--ds-corner:var(--ds-fg)]">
        <div className="flex items-center gap-2">
          <DamaLogo className="h-5" />
          <span className="ds-annot uppercase">painel</span>
        </div>
        <h1 className="mt-8 text-2xl font-medium tracking-tight">Entrar</h1>
        <p className="mt-1 text-sm text-ds-muted">Acesso de Daniel e Marcella.</p>
        <div className="mt-6 space-y-4">
          <TextField label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Senha" type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        {erro && (
          <div className="mt-4">
            <Alert tone="danger" title={erro} />
          </div>
        )}
        <Button type="submit" loading={enviando} className="mt-6 w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
