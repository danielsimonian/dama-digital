-- /painel · etapa 3 — agenda, matrículas e pacotes de aulas
-- Regras (Daniel, 21/10/2026):
--   · aula cobrada antecipadamente de 4 em 4 (pacote), ou avulsa por aula
--   · horário fixo semanal; uma sala só
--   · sessão de estúdio é cobrada por orçamento — na agenda só ocupa horário
--   · realizada e falta consomem crédito do pacote; justificada não (vira reposição)
-- Só acrescenta.

-- ------------------------------------------------------------------
-- Matrículas
-- ------------------------------------------------------------------

create table if not exists public.matriculas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  instrumento text,
  responsavel text check (responsavel is null or responsavel in ('daniel', 'marcella')),
  modalidade text not null default 'pacote' check (modalidade in ('pacote', 'avulsa')),
  aulas_por_pacote integer not null default 4 check (aulas_por_pacote between 1 and 20),
  valor_pacote numeric(10, 2) not null default 400 check (valor_pacote >= 0),
  valor_aula numeric(10, 2) not null default 130 check (valor_aula >= 0),
  duracao_min integer not null default 50 check (duracao_min between 15 and 240),
  -- [{"dia": 1, "hora": "19:00"}] · dia 0 = segunda … 6 = domingo
  horarios jsonb not null default '[]'::jsonb,
  inicio date not null default current_date,
  fim date,
  status text not null default 'ativa' check (status in ('ativa', 'pausada', 'encerrada')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists matriculas_cliente_idx on public.matriculas (cliente_id);

create trigger matriculas_updated_at before update on public.matriculas
  for each row execute function update_updated_at();

-- pacotes de aulas pagos antecipadamente
create table if not exists public.pacotes_aulas (
  id uuid primary key default gen_random_uuid(),
  matricula_id uuid not null references public.matriculas (id) on delete cascade,
  numero integer not null,
  total integer not null check (total > 0),
  valor numeric(10, 2) not null,
  lancamento_id uuid references public.lancamentos (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (matricula_id, numero)
);

-- ------------------------------------------------------------------
-- Agenda
-- ------------------------------------------------------------------

create table if not exists public.eventos_agenda (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('aula', 'sessao', 'outro')),
  cliente_id uuid references public.clientes (id) on delete set null,
  matricula_id uuid references public.matriculas (id) on delete set null,
  pacote_id uuid references public.pacotes_aulas (id) on delete set null,
  orcamento_id uuid references public.orcamentos (id) on delete set null,
  lancamento_id uuid references public.lancamentos (id) on delete set null,
  titulo text not null,
  inicio timestamptz not null,
  fim timestamptz not null,
  responsavel text check (responsavel is null or responsavel in ('daniel', 'marcella')),
  presenca text not null default 'agendada' check (presenca in ('agendada', 'realizada', 'falta', 'justificada')),
  cancelado boolean not null default false,
  reposicao_de uuid references public.eventos_agenda (id) on delete set null,
  -- horário gerado pela matrícula; remarcar muda `inicio`, não este
  slot_original timestamptz,
  -- cobrança por aula quando não há pacote (aula avulsa)
  valor_aula numeric(10, 2) check (valor_aula >= 0),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (fim > inicio),
  unique (matricula_id, slot_original)
);
create index if not exists eventos_agenda_inicio_idx on public.eventos_agenda (inicio);
create index if not exists eventos_agenda_cliente_idx on public.eventos_agenda (cliente_id);
create index if not exists eventos_agenda_pacote_idx on public.eventos_agenda (pacote_id);

create trigger eventos_agenda_updated_at before update on public.eventos_agenda
  for each row execute function update_updated_at();

-- ------------------------------------------------------------------
-- RLS: só equipe
-- ------------------------------------------------------------------

alter table public.matriculas enable row level security;
alter table public.pacotes_aulas enable row level security;
alter table public.eventos_agenda enable row level security;
create policy "equipe_tudo" on public.matriculas for all to authenticated using (public.is_equipe()) with check (public.is_equipe());
create policy "equipe_tudo" on public.pacotes_aulas for all to authenticated using (public.is_equipe()) with check (public.is_equipe());
create policy "equipe_tudo" on public.eventos_agenda for all to authenticated using (public.is_equipe()) with check (public.is_equipe());

-- ------------------------------------------------------------------
-- Pacote novo = lançamento novo
-- ------------------------------------------------------------------

create or replace function public.criar_pacote_aulas(p_matricula uuid, p_vencimento date)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  m public.matriculas;
  v_nome text;
  v_numero integer;
  v_lanc uuid;
  v_pacote uuid;
begin
  select * into m from public.matriculas where id = p_matricula;
  select nome into v_nome from public.clientes where id = m.cliente_id;
  select coalesce(max(numero), 0) + 1 into v_numero from public.pacotes_aulas where matricula_id = m.id;

  insert into public.lancamentos (cliente_id, descricao, origem, divisao, valor, vencimento)
  values (
    m.cliente_id,
    'Aulas' || coalesce(' de ' || lower(m.instrumento), '') || ' · pacote ' || v_numero || ' (' || m.aulas_por_pacote || ' aulas) · ' || coalesce(v_nome, ''),
    'mensalidade', 'studio', m.valor_pacote, p_vencimento
  )
  returning id into v_lanc;

  insert into public.pacotes_aulas (matricula_id, numero, total, valor, lancamento_id)
  values (m.id, v_numero, m.aulas_por_pacote, m.valor_pacote, v_lanc)
  returning id into v_pacote;

  return v_pacote;
end;
$$;

-- matrícula em pacote já nasce com o 1º pacote (cobrança antecipada)
create or replace function public.matricula_primeiro_pacote()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.modalidade = 'pacote' and new.status = 'ativa' then
    perform public.criar_pacote_aulas(new.id, new.inicio);
  end if;
  return new;
end;
$$;

create trigger matriculas_primeiro_pacote after insert on public.matriculas
  for each row execute function public.matricula_primeiro_pacote();

-- ------------------------------------------------------------------
-- Presença consome crédito / gera cobrança
-- ------------------------------------------------------------------

create or replace function public.aplicar_presenca()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  m public.matriculas;
  v_consome_novo boolean := new.presenca in ('realizada', 'falta') and not new.cancelado;
  v_consome_antes boolean := tg_op = 'UPDATE' and old.presenca in ('realizada', 'falta') and not old.cancelado;
  v_pacote public.pacotes_aulas;
  v_usadas integer;
  v_prox date;
begin
  if v_consome_novo = v_consome_antes then
    return new;
  end if;

  if new.matricula_id is not null then
    select * into m from public.matriculas where id = new.matricula_id;
  end if;

  if v_consome_novo then
    if m.id is not null and m.modalidade = 'pacote' then
      -- pacote mais antigo com crédito
      select p.* into v_pacote
      from public.pacotes_aulas p
      where p.matricula_id = m.id
        and (select count(*) from public.eventos_agenda e
             where e.pacote_id = p.id and e.id <> new.id and e.presenca in ('realizada', 'falta') and not e.cancelado) < p.total
      order by p.numero
      limit 1;

      if v_pacote.id is null then
        select * into v_pacote from public.pacotes_aulas where id = public.criar_pacote_aulas(m.id, (new.inicio at time zone 'America/Sao_Paulo')::date);
      end if;
      new.pacote_id := v_pacote.id;

      select count(*) + 1 into v_usadas from public.eventos_agenda e
      where e.pacote_id = v_pacote.id and e.id <> new.id and e.presenca in ('realizada', 'falta') and not e.cancelado;

      -- última aula do pacote: cobra o próximo, vencendo na próxima aula
      if v_usadas >= v_pacote.total and m.status = 'ativa'
         and not exists (select 1 from public.pacotes_aulas where matricula_id = m.id and numero > v_pacote.numero) then
        select (min(e.inicio) at time zone 'America/Sao_Paulo')::date into v_prox from public.eventos_agenda e
        where e.matricula_id = m.id and e.inicio > new.inicio and e.presenca = 'agendada' and not e.cancelado;
        perform public.criar_pacote_aulas(m.id, coalesce(v_prox, (new.inicio at time zone 'America/Sao_Paulo')::date + 7));
      end if;
    elsif new.valor_aula is not null and new.valor_aula > 0 and new.lancamento_id is null then
      insert into public.lancamentos (cliente_id, descricao, origem, divisao, valor, vencimento)
      values (
        new.cliente_id,
        new.titulo || ' · ' || to_char(new.inicio at time zone 'America/Sao_Paulo', 'DD/MM'),
        'avulso', 'studio', new.valor_aula, (new.inicio at time zone 'America/Sao_Paulo')::date
      )
      returning id into new.lancamento_id;
    end if;
  else
    -- desfez a presença: libera o crédito; cobrança avulsa ainda não paga é cancelada
    new.pacote_id := null;
    if new.lancamento_id is not null then
      update public.lancamentos set status = 'cancelado' where id = new.lancamento_id and status = 'pendente';
      new.lancamento_id := null;
    end if;
  end if;

  return new;
end;
$$;

create trigger eventos_agenda_presenca before insert or update of presenca, cancelado on public.eventos_agenda
  for each row execute function public.aplicar_presenca();

-- ------------------------------------------------------------------
-- Aulas recorrentes: materializa os horários das matrículas num intervalo
-- ------------------------------------------------------------------

create or replace function public.gerar_aulas(p_de date, p_ate date)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_n integer;
begin
  insert into public.eventos_agenda (tipo, cliente_id, matricula_id, titulo, inicio, fim, responsavel, slot_original, valor_aula)
  select
    'aula', m.cliente_id, m.id,
    'Aula' || coalesce(' de ' || lower(m.instrumento), ''),
    s.slot, s.slot + make_interval(mins => m.duracao_min),
    m.responsavel, s.slot,
    case when m.modalidade = 'avulsa' then m.valor_aula end
  from public.matriculas m
  cross join lateral jsonb_array_elements(m.horarios) h
  cross join lateral generate_series(greatest(p_de, m.inicio)::timestamp, least(p_ate, coalesce(m.fim, p_ate))::timestamp, interval '1 day') d
  cross join lateral (
    select ((d::date + (h->>'hora')::time) at time zone 'America/Sao_Paulo') as slot
  ) s
  where m.status = 'ativa'
    and extract(isodow from d) - 1 = (h->>'dia')::integer
  on conflict (matricula_id, slot_original) do nothing;

  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

revoke execute on function public.criar_pacote_aulas(uuid, date) from public, anon;
revoke execute on function public.gerar_aulas(date, date) from public, anon;
revoke execute on function public.matricula_primeiro_pacote() from public, anon, authenticated;
revoke execute on function public.aplicar_presenca() from public, anon, authenticated;
grant execute on function public.criar_pacote_aulas(uuid, date) to authenticated;
grant execute on function public.gerar_aulas(date, date) to authenticated;
