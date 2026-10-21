-- /painel · etapa 1 — Pessoas (cadastro único em clientes) + Catálogo
-- Só acrescenta: nada existente é alterado ou removido.

-- Pessoas: papéis, status, instrumento e responsável em clientes.
-- `areas` (tech/sports/studio) continua existindo para o /admin antigo e o portal.
alter table public.clientes
  add column if not exists papeis text[] not null default '{}',
  add column if not exists status text not null default 'ativo',
  add column if not exists instrumento text,
  add column if not exists responsavel text;

alter table public.clientes
  add constraint clientes_papeis_check check (papeis <@ array['aluno', 'estudio', 'tech', 'sports']::text[]),
  add constraint clientes_status_check check (status in ('ativo', 'pausado', 'lead')),
  add constraint clientes_responsavel_check check (responsavel is null or responsavel in ('daniel', 'marcella'));

-- papéis iniciais a partir das áreas; studio vira estúdio (aluno é marcado à mão)
update public.clientes
set papeis = array(
  select distinct case a when 'studio' then 'estudio' else a end
  from unnest(areas) as a
  where a in ('tech', 'sports', 'studio')
)
where papeis = '{}' and areas is not null;

-- Catálogo: preços base que alimentam o gerador de orçamentos
create table if not exists public.catalogo_servicos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  divisao text not null check (divisao in ('tech', 'sports', 'studio')),
  valor numeric(10, 2) not null default 0 check (valor >= 0),
  unidade text not null check (unidade in ('aula', 'mês', 'hora', 'pacote', 'faixa', 'projeto', 'evento', 'dia', 'atleta')),
  descricao text,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger catalogo_servicos_updated_at
  before update on public.catalogo_servicos
  for each row execute function update_updated_at();

alter table public.catalogo_servicos enable row level security;

create policy "catalogo_autenticados"
  on public.catalogo_servicos
  for all
  to authenticated
  using (true)
  with check (true);
