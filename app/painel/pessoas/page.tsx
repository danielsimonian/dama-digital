'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, UserPlus, MessageCircle, Pencil, FileText, Mail, ArrowUpRight } from 'lucide-react';
import { supabase, type Cliente, type Divisao, type Orcamento, type Papel, type PessoaStatus, type Responsavel } from '@/lib/supabase';
import { cn, Button, Avatar, Alert, DivisionBadge } from '@/components/ds/primitives';
import { Drawer, Modal, useToast } from '@/components/ds/interactive';
import { TextField, TextArea, SelectField, Checkbox } from '@/components/ds/fields';
import { PapelBadge } from '@/components/ds/admin/display';
import { DataTable, type Column } from '@/components/ds/admin/table';
import { ScreenHeader, Chips } from '../_components/ui';

const PAPEIS: { id: Papel; label: string; desc: string }[] = [
  { id: 'aluno', label: 'Aluno', desc: 'aulas de música · DAMA Studio' },
  { id: 'estudio', label: 'Estúdio', desc: 'gravação, mix, produção' },
  { id: 'tech', label: 'Tech', desc: 'sites e sistemas' },
  { id: 'sports', label: 'Sports', desc: 'torneios e eventos' },
];

const STATUS_LABEL: Record<PessoaStatus, string> = { ativo: 'Ativo', pausado: 'Pausado', lead: 'Lead' };
const RESP_LABEL: Record<Responsavel, string> = { daniel: 'Daniel Simonian', marcella: 'Marcella Lima' };
const RESP_FOTO: Record<Responsavel, string> = { daniel: '/images/daniel.png', marcella: '/images/marcella.png' };

const ORC_STATUS: Record<Orcamento['status'], string> = {
  rascunho: 'rascunho',
  enviado: 'enviado',
  visualizado: 'visualizado',
  aprovado: 'aprovado',
  recusado: 'recusado',
  expirado: 'expirado',
};

type OrcResumo = Pick<Orcamento, 'id' | 'numero' | 'projeto_titulo' | 'status' | 'divisao' | 'data_emissao'>;

type Form = {
  id?: string;
  nome: string;
  papeis: Papel[];
  status: PessoaStatus;
  telefone: string;
  email: string;
  empresa: string;
  documento: string;
  instrumento: string;
  responsavel: Responsavel | '';
  notas: string;
};

const VAZIO: Form = { nome: '', papeis: [], status: 'ativo', telefone: '', email: '', empresa: '', documento: '', instrumento: '', responsavel: '', notas: '' };

function paraForm(c: Cliente): Form {
  return {
    id: c.id,
    nome: c.nome,
    papeis: c.papeis ?? [],
    status: c.status ?? 'ativo',
    telefone: c.telefone ?? '',
    email: c.email ?? '',
    empresa: c.empresa ?? '',
    documento: c.documento ?? '',
    instrumento: c.instrumento ?? '',
    responsavel: c.responsavel ?? '',
    notas: c.notas ?? '',
  };
}

// o /admin antigo e o portal ainda leem `areas` (divisões)
function areasDosPapeis(papeis: Papel[]): Divisao[] {
  const areas = new Set<Divisao>();
  for (const p of papeis) areas.add(p === 'aluno' || p === 'estudio' ? 'studio' : p);
  return [...areas];
}

function whatsappUrl(telefone: string) {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null;
  return `https://wa.me/${digitos.length <= 11 ? '55' : ''}${digitos}`;
}

function formatarDesde(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
}

/* ------------------------------------------------------------------ */
/* Ficha                                                               */
/* ------------------------------------------------------------------ */

function Ficha({ p, onEditar }: { p: Cliente; onEditar: () => void }) {
  const [carregados, setCarregados] = useState<{ id: string; lista: OrcResumo[] } | null>(null);
  const orcs = carregados?.id === p.id ? carregados.lista : null;

  useEffect(() => {
    supabase
      .from('orcamentos')
      .select('id, numero, projeto_titulo, status, divisao, data_emissao')
      .eq('cliente_id', p.id)
      .order('data_emissao', { ascending: false })
      .then(({ data }) => setCarregados({ id: p.id, lista: data ?? [] }));
  }, [p.id]);

  const wa = p.telefone ? whatsappUrl(p.telefone) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Avatar name={p.nome} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-medium tracking-tight">{p.nome}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {(p.papeis ?? []).map((r) => (
              <PapelBadge key={r} papel={r} />
            ))}
            {p.status && p.status !== 'ativo' && <span className="ds-annot uppercase">{STATUS_LABEL[p.status]}</span>}
            {p.instrumento && <span className="ds-annot">· {p.instrumento}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-ds-sm border border-ds-line text-sm text-ds-fg hover:bg-ds-surface"
          >
            <MessageCircle className="size-4" strokeWidth={1.5} aria-hidden /> WhatsApp
          </a>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-ds-sm border border-dashed border-ds-line text-xs text-ds-subtle">sem WhatsApp</span>
        )}
        <Button variant="secondary" size="sm" className="h-10" onClick={onEditar}>
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden /> Editar
        </Button>
      </div>

      <dl className="divide-y divide-ds-line border-y border-ds-line text-sm">
        {[
          ['WhatsApp', p.telefone],
          ['E-mail', p.email],
          ['Empresa', p.empresa],
          ['CPF/CNPJ', p.documento],
          ['Responsável', p.responsavel ? RESP_LABEL[p.responsavel].split(' ')[0] : null],
          ['Desde', formatarDesde(p.created_at)],
        ]
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="ds-annot uppercase">{k}</dt>
              <dd className="min-w-0 truncate text-right text-ds-fg">{v}</dd>
            </div>
          ))}
      </dl>

      {p.notas && (
        <div>
          <p className="ds-annot mb-2 uppercase">Notas</p>
          <p className="whitespace-pre-line text-sm text-ds-muted">{p.notas}</p>
        </div>
      )}

      <div>
        <p className="ds-annot mb-2 uppercase">Orçamentos</p>
        {orcs === null ? (
          <p className="ds-annot">carregando…</p>
        ) : orcs.length === 0 ? (
          <p className="text-sm text-ds-subtle">Nenhum orçamento ainda.</p>
        ) : (
          <ul className="divide-y divide-ds-line border-y border-ds-line">
            {orcs.map((o) => (
              <li key={o.id} data-divisao={o.divisao}>
                <a href={`/admin/orcamentos/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-ds-surface">
                  <FileText className="size-4 shrink-0 text-ds-subtle" strokeWidth={1.5} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ds-fg">{o.projeto_titulo}</span>
                    <span className="ds-annot">
                      #{o.numero} · {ORC_STATUS[o.status]}
                    </span>
                  </span>
                  <DivisionBadge divisao={o.divisao} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a href={`/admin/clientes/${p.id}`} className="ds-annot inline-flex items-center gap-1 hover:text-ds-fg">
        sessões, conteúdo e financeiro no admin antigo <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tela                                                                */
/* ------------------------------------------------------------------ */

function PessoasTela() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [pessoas, setPessoas] = useState<Cliente[] | null>(null);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todos' | Papel | 'sem'>('todos');
  const [sel, setSel] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [versao, setVersao] = useState(0);
  const [pedido, setPedido] = useState('');

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .order('nome')
      .then(({ data, error }) => {
        if (error) setErro(error.message);
        else setPessoas(data);
      });
  }, [versao]);

  // ?novo=1 e ?id= vêm da paleta de comandos
  const queryUrl = params.toString();
  if (queryUrl !== pedido) {
    setPedido(queryUrl);
    const id = params.get('id');
    if (params.get('novo') === '1') setForm(VAZIO);
    else if (id) {
      setSel(id);
      if (typeof window !== 'undefined' && window.innerWidth < 1280) setDrawer(true);
    }
  }
  useEffect(() => {
    if (queryUrl) router.replace('/painel/pessoas');
  }, [queryUrl, router]);

  const lista = pessoas ?? [];
  const filtradas = lista.filter((p) => {
    const papeis = p.papeis ?? [];
    const okPapel = filtro === 'todos' || (filtro === 'sem' ? papeis.length === 0 : papeis.includes(filtro));
    const q = busca.trim().toLowerCase();
    const okBusca = !q || [p.nome, p.empresa, p.email, p.telefone].some((v) => v?.toLowerCase().includes(q));
    return okPapel && okBusca;
  });
  const atual = lista.find((p) => p.id === sel) ?? filtradas[0] ?? null;

  const salvar = async () => {
    if (!form) return;
    if (!form.nome.trim()) {
      toast({ tone: 'danger', title: 'O nome é obrigatório' });
      return;
    }
    setSalvando(true);
    const dados = {
      nome: form.nome.trim(),
      papeis: form.papeis,
      areas: areasDosPapeis(form.papeis),
      status: form.status,
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      empresa: form.empresa.trim() || null,
      documento: form.documento.trim() || null,
      instrumento: form.papeis.includes('aluno') ? form.instrumento.trim() || null : null,
      responsavel: form.responsavel || null,
      notas: form.notas.trim() || null,
    };
    const res = form.id
      ? await supabase.from('clientes').update(dados).eq('id', form.id).select('id').single()
      : await supabase.from('clientes').insert(dados).select('id').single();
    setSalvando(false);
    if (res.error) {
      toast({ tone: 'danger', title: 'Não foi possível salvar', description: res.error.message });
      return;
    }
    toast({ tone: 'success', title: form.id ? 'Cadastro atualizado' : 'Pessoa cadastrada', description: dados.nome });
    setSel(res.data.id);
    setForm(null);
    setVersao((v) => v + 1);
  };

  const conta = (f: Papel) => lista.filter((p) => (p.papeis ?? []).includes(f)).length;
  const semPapel = lista.filter((p) => !(p.papeis ?? []).length).length;

  const colunas: Column<Cliente>[] = [
    {
      key: 'nome',
      header: 'Nome',
      sort: (p) => p.nome,
      cell: (p) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={p.nome} size="sm" />
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate text-ds-fg">{p.nome}</span>
              {p.status && p.status !== 'ativo' && <span className="ds-annot uppercase">{STATUS_LABEL[p.status]}</span>}
            </span>
            <span className="mt-0.5 flex gap-1">
              {(p.papeis ?? []).map((r) => (
                <PapelBadge key={r} papel={r} />
              ))}
              {p.empresa && <span className="truncate text-xs text-ds-muted">{p.empresa}</span>}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'contato',
      header: 'Contato',
      hideBelow: 'lg',
      cell: (p) => <span className="font-ds-mono text-xs text-ds-muted">{p.telefone || p.email || '—'}</span>,
    },
    {
      key: 'resp',
      header: 'Resp.',
      hideBelow: 'xl',
      cell: (p) => (p.responsavel ? <Avatar name={RESP_LABEL[p.responsavel]} src={RESP_FOTO[p.responsavel]} size="sm" /> : <span className="ds-annot">—</span>),
    },
    {
      key: 'desde',
      header: 'Desde',
      align: 'right',
      sort: (p) => p.created_at,
      cell: (p) => <span className="font-ds-mono text-xs text-ds-subtle">{formatarDesde(p.created_at)}</span>,
    },
  ];

  const papelSel = form?.papeis ?? [];

  return (
    <>
      <ScreenHeader
        sub="alunos e clientes · um cadastro por pessoa"
        title="Pessoas"
        actions={
          <Button size="sm" onClick={() => setForm(VAZIO)}>
            <UserPlus className="size-4" strokeWidth={1.5} aria-hidden /> Cadastrar
          </Button>
        }
      />
      <div className="grid xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 p-4 md:p-6">
          {erro && (
            <div className="mb-4">
              <Alert tone="danger" title="Erro ao carregar pessoas">
                {erro}
              </Alert>
            </div>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ds-subtle" strokeWidth={1.5} aria-hidden />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome, empresa, contato"
                aria-label="Buscar pessoa"
                className="h-8 w-full rounded-ds-xs border border-ds-line bg-ds-surface pl-8 pr-2 text-sm outline-none focus:border-ds-accent"
              />
            </div>
            <Chips
              value={filtro}
              onChange={setFiltro}
              options={[
                { id: 'todos', label: 'Todos', count: lista.length },
                { id: 'aluno', label: 'Alunos', count: conta('aluno') },
                { id: 'estudio', label: 'Estúdio', count: conta('estudio') },
                { id: 'tech', label: 'Tech', count: conta('tech') },
                { id: 'sports', label: 'Sports', count: conta('sports') },
                ...(semPapel ? [{ id: 'sem' as const, label: 'Sem papel', count: semPapel }] : []),
              ]}
            />
          </div>
          <DataTable
            rows={filtradas}
            columns={colunas}
            getId={(p) => p.id}
            selectedId={atual?.id}
            loading={pessoas === null && !erro}
            onSelect={(p) => {
              setSel(p.id);
              if (window.innerWidth < 1280) setDrawer(true);
            }}
            empty={
              <p className="border-y border-ds-line py-10 text-center text-sm text-ds-subtle">
                {busca ? `Ninguém com “${busca}”.` : 'Ninguém aqui ainda.'} Cadastre pelo botão acima ou pelo ⌘K.
              </p>
            }
          />
        </div>
        <aside className="hidden border-l border-ds-line p-5 xl:block">
          {atual ? <Ficha p={atual} onEditar={() => setForm(paraForm(atual))} /> : <p className="text-sm text-ds-subtle">Selecione uma pessoa.</p>}
        </aside>
      </div>

      <Drawer open={drawer && !!atual} onClose={() => setDrawer(false)} title={atual?.nome ?? ''}>
        {atual && (
          <Ficha
            p={atual}
            onEditar={() => {
              setDrawer(false);
              setForm(paraForm(atual));
            }}
          />
        )}
      </Drawer>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        index={form?.id ? 'editar cadastro' : 'nome e WhatsApp bastam · o resto pode vir depois'}
        title={form?.id ? form.nome || 'Pessoa' : 'Nova pessoa'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancelar
            </Button>
            <Button onClick={salvar} loading={salvando}>
              Salvar
            </Button>
          </>
        }
      >
        {form && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <TextField label="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} autoFocus />
            <TextField label="WhatsApp" type="tel" optional value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(13) 99999-9999" />
            <fieldset>
              <legend className="mb-1 text-sm text-ds-fg">Papéis</legend>
              <div className="grid grid-cols-2 gap-x-3">
                {PAPEIS.map((r) => (
                  <Checkbox
                    key={r.id}
                    label={r.label}
                    description={r.desc}
                    checked={papelSel.includes(r.id)}
                    onChange={(e) =>
                      setForm({ ...form, papeis: e.target.checked ? [...form.papeis, r.id] : form.papeis.filter((x) => x !== r.id) })
                    }
                  />
                ))}
              </div>
            </fieldset>
            {papelSel.includes('aluno') && (
              <TextField label="Instrumento" optional value={form.instrumento} onChange={(e) => setForm({ ...form, instrumento: e.target.value })} placeholder="Violão, piano, canto…" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PessoaStatus })}
                options={(Object.keys(STATUS_LABEL) as PessoaStatus[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
              />
              <SelectField
                label="Responsável"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value as Responsavel | '' })}
                options={[
                  { value: '', label: '—' },
                  { value: 'daniel', label: 'Daniel' },
                  { value: 'marcella', label: 'Marcella' },
                ]}
              />
            </div>
            <TextField label="E-mail" type="email" optional value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} leading={<Mail className="size-4" strokeWidth={1.5} />} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Empresa" optional value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
              <TextField label="CPF/CNPJ" optional value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
            </div>
            <TextArea label="Notas" optional value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className={cn('min-h-20')} />
          </div>
        )}
      </Modal>
    </>
  );
}

export default function PessoasPage() {
  return (
    <Suspense>
      <PessoasTela />
    </Suspense>
  );
}
