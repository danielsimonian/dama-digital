// Área do cliente: entra com a senha do portal (RPCs portal_*) e vê o que a ficha no /painel libera.

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { Lock, LogOut } from 'lucide-react';
import { supabase, type PortalPainel } from '@/lib/supabase';
import { Alert, Button, Eyebrow, Frame, Skeleton } from '@/components/ds/primitives';
import { TextField } from '@/components/ds/fields';
import { DamaLogo } from '@/components/ds/site';
import { PortalConteudo } from './_components/Portal';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

type Estado = 'carregando' | 'inexistente' | 'senha' | 'dentro';

export default function ClientePublicoPage() {
  const { slug } = useParams<{ slug: string }>();
  const chave = `portal_token_${slug}`;
  const [estado, setEstado] = useState<Estado>('carregando');
  const [nome, setNome] = useState('');
  const [dados, setDados] = useState<PortalPainel | null>(null);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  // carrega os dados de um token salvo; se expirou, volta para a senha
  const abrir = async (token: string) => {
    const { data, error } = await supabase.rpc('portal_painel', { p_token: token });
    if (error || !data) {
      sessionStorage.removeItem(chave);
      return false;
    }
    setDados(data as PortalPainel);
    setEstado('dentro');
    return true;
  };

  useEffect(() => {
    supabase.rpc('portal_cliente', { p_slug: slug }).then(async ({ data, error }) => {
      if (error || !data) {
        setEstado('inexistente');
        return;
      }
      setNome((data as { nome: string }).nome);
      const token = sessionStorage.getItem(chave);
      if (!(token && (await abrir(token)))) setEstado('senha');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntrando(true);
    setErro('');
    const { data: token, error } = await supabase.rpc('portal_entrar', { p_slug: slug, p_senha: senha });
    if (error || !token || !(await abrir(token))) {
      // depois de 10 erros em 15 min o portal_entrar recusa até a senha certa
      setErro('Senha incorreta. Depois de muitas tentativas, o acesso fica pausado por 15 minutos.');
    } else {
      sessionStorage.setItem(chave, token);
      setSenha('');
    }
    setEntrando(false);
  };

  const sair = () => {
    const token = sessionStorage.getItem(chave);
    if (token) supabase.rpc('portal_sair', { p_token: token }).then(() => {});
    sessionStorage.removeItem(chave);
    setDados(null);
    setEstado('senha');
  };

  return (
    <div className={`${geist.variable} ${geistMono.variable} ds min-h-dvh bg-ds-bg text-ds-fg`} data-theme="dark">
      <header className="border-b border-ds-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 md:px-6">
          <DamaLogo className="h-7" />
          {estado === 'dentro' ? (
            <button onClick={sair} className="ds-press inline-flex h-10 items-center gap-2 px-2 text-sm text-ds-muted transition-colors hover:text-ds-fg">
              <LogOut className="size-4" strokeWidth={1.5} aria-hidden /> Sair
            </button>
          ) : (
            <span className="ds-annot uppercase">Área do cliente</span>
          )}
        </div>
      </header>

      {estado === 'carregando' && (
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-12 md:px-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40" />
        </div>
      )}

      {estado === 'inexistente' && (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <Eyebrow>404</Eyebrow>
          <h1 className="mt-4 text-2xl font-medium tracking-tight">Página não encontrada</h1>
          <p className="mt-2 text-sm text-ds-muted">Confira o link que a gente te mandou ou fale com a DAMA no WhatsApp.</p>
        </div>
      )}

      {estado === 'senha' && (
        <div className="mx-auto max-w-md px-4 py-16 md:py-24">
          <Frame className="bg-ds-surface p-6 sm:p-8">
            <Eyebrow>Área do cliente</Eyebrow>
            <h1 className="mt-4 text-2xl font-medium tracking-tight">{nome}</h1>
            <p className="mt-1 text-sm text-ds-muted">Digite a senha que a DAMA te enviou.</p>
            <form onSubmit={entrar} className="mt-6 space-y-4">
              <TextField
                label="Senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                leading={<Lock className="size-4" strokeWidth={1.5} />}
                autoFocus
                required
              />
              {erro && (
                <Alert tone="danger" title="Não foi possível entrar">
                  {erro}
                </Alert>
              )}
              <Button type="submit" size="lg" className="w-full" loading={entrando} disabled={!senha}>
                Entrar
              </Button>
            </form>
          </Frame>
        </div>
      )}

      {estado === 'dentro' && dados && <PortalConteudo dados={dados} />}
    </div>
  );
}
