'use client';

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Users, Tags, UserPlus, Plus, LogOut, Moon, Sun, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { cn, Avatar } from '@/components/ds/primitives';
import { ToastProvider } from '@/components/ds/interactive';
import { AdminSidebar, CommandPalette, type Command, type NavItem } from '@/components/ds/admin/shell';

type Theme = 'light' | 'dark';

const NAV: (NavItem & { href: string })[] = [
  { id: 'inicio', href: '/painel', label: 'Início', icon: <LayoutGrid /> },
  { id: 'pessoas', href: '/painel/pessoas', label: 'Pessoas', icon: <Users /> },
  { id: 'orcamentos', href: '/painel/orcamentos', label: 'Orçamentos', icon: <FileText /> },
  { id: 'catalogo', href: '/painel/catalogo', label: 'Catálogo', icon: <Tags /> },
];

const FOTOS: Record<string, string> = {
  daniel: '/images/daniel.png',
  marcella: '/images/marcella.png',
};

function readTheme(): Theme {
  try {
    return localStorage.getItem('painel-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function subscribeTheme(cb: () => void) {
  window.addEventListener('painel-theme', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('painel-theme', cb);
    window.removeEventListener('storage', cb);
  };
}

function activeId(pathname: string) {
  const hit = NAV.filter((n) => n.href !== '/painel').find((n) => pathname.startsWith(n.href));
  return hit?.id ?? 'inicio';
}

export function PainelShell({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => 'light' as Theme);
  const [palette, setPalette] = useState(false);
  const [pessoas, setPessoas] = useState<{ id: string; nome: string }[]>([]);
  const isLogin = pathname === '/painel/entrar';

  useEffect(() => {
    if (!loading && !user && !isLogin) router.replace('/painel/entrar');
  }, [loading, user, isLogin, router]);

  useEffect(() => {
    if (!user || isLogin) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [user, isLogin]);

  // nomes para a paleta: carregados quando ela abre
  useEffect(() => {
    if (!palette) return;
    supabase
      .from('clientes')
      .select('id, nome')
      .order('nome')
      .then(({ data }) => setPessoas(data ?? []));
  }, [palette]);

  const toggleTheme = () => {
    try {
      localStorage.setItem('painel-theme', theme === 'light' ? 'dark' : 'light');
    } catch {
      /* armazenamento indisponível — segue sem lembrar */
    }
    window.dispatchEvent(new Event('painel-theme'));
  };

  const sair = async () => {
    await signOut();
    router.replace('/painel/entrar');
  };

  let body: ReactNode;
  if (isLogin) {
    body = children;
  } else if (loading || !user) {
    body = (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-ds-subtle" strokeWidth={1.5} aria-label="Carregando" />
      </div>
    );
  } else {
    const nome = profile?.nome || user.email || 'Usuário';
    const foto = profile?.avatar_url || FOTOS[nome.split(' ')[0].toLowerCase()] || null;
    const active = activeId(pathname);
    const commands: Command[] = [
      { id: 'n-pessoa', group: 'Criar', label: 'Nova pessoa', icon: <UserPlus />, run: () => router.push('/painel/pessoas?novo=1') },
      { id: 'n-orc', group: 'Criar', label: 'Novo orçamento', icon: <FileText />, run: () => router.push('/painel/orcamentos/novo') },
      { id: 'n-item', group: 'Criar', label: 'Novo item no catálogo', icon: <Plus />, run: () => router.push('/painel/catalogo?novo=1') },
      ...NAV.map((n) => ({ id: `go-${n.id}`, group: 'Ir para', label: n.label, icon: n.icon, run: () => router.push(n.href) })),
      ...pessoas.map((p) => ({ id: `p-${p.id}`, group: 'Pessoas', label: p.nome, icon: <Users />, run: () => router.push(`/painel/pessoas?id=${p.id}`) })),
    ];

    body = (
      <>
        {/* barra mobile */}
        <div className="sticky top-0 z-30 flex items-center gap-1 overflow-x-auto border-b border-ds-line bg-ds-bg p-2 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              aria-current={active === n.id ? 'page' : undefined}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-ds-xs px-2.5 text-sm [&_svg]:size-4',
                active === n.id ? 'bg-ds-surface-2 text-ds-fg' : 'text-ds-muted',
              )}
            >
              {n.icon}
              {n.label}
            </Link>
          ))}
          <button onClick={sair} aria-label="Sair" className="ml-auto inline-flex size-9 shrink-0 items-center justify-center text-ds-subtle">
            <LogOut className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="lg:grid lg:h-dvh lg:grid-cols-[14rem_1fr]">
          <aside className="hidden border-r border-ds-line bg-ds-surface/50 lg:block">
            <AdminSidebar
              items={NAV}
              active={active}
              onChange={(id) => router.push(NAV.find((n) => n.id === id)?.href ?? '/painel')}
              onSearch={() => setPalette(true)}
              footer={
                <div className="flex items-center gap-2.5">
                  <Avatar name={nome} src={foto} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ds-fg">{nome.split(' ')[0]}</p>
                    <p className="ds-annot truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    aria-label={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
                    className="inline-flex size-8 items-center justify-center text-ds-subtle hover:text-ds-fg"
                  >
                    {theme === 'light' ? <Moon className="size-4" strokeWidth={1.5} /> : <Sun className="size-4" strokeWidth={1.5} />}
                  </button>
                  <button onClick={sair} aria-label="Sair" className="inline-flex size-8 items-center justify-center text-ds-subtle hover:text-ds-fg">
                    <LogOut className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              }
            />
          </aside>
          <main className="min-w-0 lg:overflow-y-auto">{children}</main>
        </div>

        <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
      </>
    );
  }

  return (
    <div className="ds min-h-dvh bg-ds-bg text-ds-fg" data-theme={theme}>
      <ToastProvider>{body}</ToastProvider>
    </div>
  );
}
