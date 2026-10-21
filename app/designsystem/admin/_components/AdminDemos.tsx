'use client';

import { useState } from 'react';
import { LayoutGrid, Users, CalendarDays, Wallet, FileText, Tags, UserPlus, Receipt, Search } from 'lucide-react';
import { Avatar, Button } from '@/components/ds/primitives';
import { useToast } from '@/components/ds/interactive';
import { AdminSidebar, CommandPalette, UserSwitch } from '@/components/ds/admin/shell';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { WeekCalendar, AttendanceControl } from '@/components/ds/admin/agenda';
import { PapelBadge, brl } from '@/components/ds/admin/display';
import type { Pessoa, Presenca } from '@/components/ds/admin/types';
import { pessoas, eventos } from '../_data';

const NOMES = Object.fromEntries(pessoas.map((p) => [p.id, p.nome]));
const USERS = [
  { id: 'daniel', nome: 'Daniel Simonian', foto: '/images/daniel.png' },
  { id: 'marcella', nome: 'Marcella Lima', foto: '/images/marcella.png' },
];

export function SidebarDemo() {
  const [active, setActive] = useState('agenda');
  const [user, setUser] = useState('marcella');
  const [open, setOpen] = useState(false);
  return (
    <div className="h-[30rem] w-full max-w-[15rem] border border-ds-line bg-ds-surface/50">
      <AdminSidebar
        active={active}
        onChange={setActive}
        onSearch={() => setOpen(true)}
        items={[
          { id: 'inicio', label: 'Início', icon: <LayoutGrid /> },
          { id: 'pessoas', label: 'Pessoas', icon: <Users />, count: 11 },
          { id: 'agenda', label: 'Agenda', icon: <CalendarDays />, count: 10 },
          { id: 'financeiro', label: 'Financeiro', icon: <Wallet />, alert: true },
          { id: 'orcamentos', label: 'Orçamentos', icon: <FileText />, count: 3 },
          { id: 'catalogo', label: 'Catálogo', icon: <Tags />, count: 14 },
        ]}
        footer={<UserSwitch users={USERS} active={user} onChange={setUser} />}
      />
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={[{ id: 'x', group: 'Ir para', label: 'Agenda', icon: <CalendarDays />, run: () => setActive('agenda') }]}
      />
    </div>
  );
}

export function PaletteDemo() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const done = (t: string) => () => toast({ tone: 'success', title: t });
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Search className="size-4" strokeWidth={1.5} aria-hidden /> Abrir paleta
      </Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={[
          { id: 'a', group: 'Criar', label: 'Novo aluno', hint: 'N A', icon: <UserPlus />, run: done('Novo aluno') },
          { id: 'b', group: 'Criar', label: 'Registrar pagamento', hint: 'N P', icon: <Receipt />, run: done('Registrar pagamento') },
          { id: 'c', group: 'Criar', label: 'Novo orçamento', hint: 'N O', icon: <FileText />, run: done('Novo orçamento') },
          ...pessoas.slice(0, 5).map((p) => ({ id: p.id, group: 'Pessoas', label: p.nome, hint: p.papeis.join(' · '), icon: <Users />, run: done(p.nome) })),
        ]}
      />
    </>
  );
}

const COLS: Column<Pessoa>[] = [
  {
    key: 'nome',
    header: 'Nome',
    sort: (p) => p.nome,
    cell: (p) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={p.nome} size="sm" />
        <span className="text-ds-fg">{p.nome}</span>
      </span>
    ),
  },
  {
    key: 'papel',
    header: 'Papel',
    cell: (p) => (
      <span className="flex gap-1">
        {p.papeis.map((r) => (
          <PapelBadge key={r} papel={r} />
        ))}
      </span>
    ),
  },
  { key: 'desde', header: 'Desde', cell: (p) => <span className="font-ds-mono text-xs text-ds-muted">{p.desde}</span>, hideBelow: 'lg' },
  {
    key: 'receber',
    header: 'A receber',
    align: 'right',
    sort: (p) => p.aReceber,
    cell: (p) => <span className={p.atrasado ? 'font-ds-mono text-xs text-ds-danger' : 'font-ds-mono text-xs'}>{p.aReceber ? brl(p.aReceber) : '—'}</span>,
  },
];

export function TableDemo({ state = 'data' }: { state?: 'data' | 'loading' | 'empty' }) {
  const [sel, setSel] = useState<string | null>('julia');
  return (
    <DataTable
      rows={state === 'empty' ? [] : pessoas.slice(0, 6)}
      columns={COLS}
      getId={(p) => p.id}
      selectedId={sel}
      onSelect={(p) => setSel(p.id)}
      loading={state === 'loading'}
      empty={
        <div className="border-y border-ds-line py-10 text-center">
          <p className="text-sm text-ds-fg">Nenhum aluno com aula na sexta</p>
          <p className="mt-1 text-xs text-ds-subtle">Libere o horário para sessões de estúdio ou mova uma reposição.</p>
        </div>
      }
    />
  );
}

export function WeekDemo() {
  const [sel, setSel] = useState<string | null>('e8');
  return <WeekCalendar eventos={eventos} nomes={NOMES} datas={[19, 20, 21, 22, 23, 24, 25]} hoje={1} agora={15.6} selectedId={sel} onSelect={(e) => setSel(e.id)} />;
}

export function AttendanceDemo() {
  const [v, setV] = useState<Presenca>('realizada');
  return <AttendanceControl value={v} onChange={setV} wide />;
}
