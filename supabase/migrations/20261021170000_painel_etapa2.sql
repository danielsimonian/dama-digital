-- /painel · etapa 2 — gerador de orçamentos v2 + lançamentos
-- Só acrescenta. Orçamentos já aprovados não geram lançamentos retroativos
-- (isso fica para a migração do financeiro, etapa 4).

-- ------------------------------------------------------------------
-- Orçamentos: plano de pagamento e versão
-- ------------------------------------------------------------------

alter table public.orcamentos
  add column if not exists entrada_pct integer check (entrada_pct between 0 and 100),
  add column if not exists parcelas integer check (parcelas between 1 and 12),
  add column if not exists versao integer not null default 1;

alter table public.orcamento_itens
  add column if not exists catalogo_id uuid references public.catalogo_servicos (id) on delete set null,
  add column if not exists unidade text;

-- cópia do orçamento a cada envio (v1, v2…)
create table if not exists public.orcamento_versoes (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references public.orcamentos (id) on delete cascade,
  versao integer not null,
  snapshot jsonb not null,
  criado_por uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (orcamento_id, versao)
);
alter table public.orcamento_versoes enable row level security;
create policy "equipe_tudo" on public.orcamento_versoes for all to authenticated using (public.is_equipe()) with check (public.is_equipe());

-- ------------------------------------------------------------------
-- Lançamentos (financeiro)
-- ------------------------------------------------------------------

create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes (id) on delete set null,
  orcamento_id uuid references public.orcamentos (id) on delete set null,
  descricao text not null,
  origem text not null check (origem in ('orcamento', 'mensalidade', 'sessao', 'pacote', 'avulso')),
  divisao text not null check (divisao in ('tech', 'sports', 'studio')),
  valor numeric(10, 2) not null check (valor >= 0),
  vencimento date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  pago_em date,
  forma text check (forma in ('Pix', 'Cartão', 'Dinheiro', 'Boleto', 'Transferência')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lancamentos_cliente_idx on public.lancamentos (cliente_id);
create index if not exists lancamentos_orcamento_idx on public.lancamentos (orcamento_id);
create index if not exists lancamentos_vencimento_idx on public.lancamentos (vencimento);

create trigger lancamentos_updated_at
  before update on public.lancamentos
  for each row execute function update_updated_at();

alter table public.lancamentos enable row level security;
create policy "equipe_tudo" on public.lancamentos for all to authenticated using (public.is_equipe()) with check (public.is_equipe());

-- ------------------------------------------------------------------
-- Aprovação gera lançamentos
-- ------------------------------------------------------------------
-- Vale para qualquer caminho de aprovação (link do cliente, admin antigo ou /painel).
-- Sem plano de pagamento (orçamentos antigos): um lançamento com o total.

create or replace function public.gerar_lancamentos_orcamento()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total numeric(10, 2);
  v_mensal numeric(10, 2);
  v_entrada numeric(10, 2);
  v_resto numeric(10, 2);
  v_parcela numeric(10, 2);
  v_n integer;
  v_dia date;
  v_ref text;
  i integer;
begin
  if new.status <> 'aprovado' or old.status = 'aprovado' then
    return new;
  end if;
  if exists (select 1 from public.lancamentos where orcamento_id = new.id) then
    return new;
  end if;

  select
    coalesce(sum(it.valor * it.quantidade), 0),
    coalesce(sum(it.valor_mensal), 0)
  into v_total, v_mensal
  from public.orcamento_itens it
  where it.orcamento_id = new.id
    and (new.tipo <> 'pacotes' or it.pacote is not distinct from new.pacote_escolhido);

  v_total := greatest(0, v_total - coalesce(new.desconto, 0));
  v_dia := coalesce(new.aprovado_em, now())::date;
  v_ref := new.numero || ' · ' || new.projeto_titulo;

  if v_total > 0 then
    if new.entrada_pct is null then
      insert into public.lancamentos (cliente_id, orcamento_id, descricao, origem, divisao, valor, vencimento)
      values (new.cliente_id, new.id, v_ref, 'orcamento', new.divisao, v_total, v_dia);
    else
      v_entrada := round(v_total * new.entrada_pct / 100.0, 2);
      v_resto := v_total - v_entrada;
      v_n := coalesce(new.parcelas, 1);

      if v_entrada > 0 then
        insert into public.lancamentos (cliente_id, orcamento_id, descricao, origem, divisao, valor, vencimento)
        values (new.cliente_id, new.id, 'Entrada ' || new.entrada_pct || '% · ' || v_ref, 'orcamento', new.divisao, v_entrada, v_dia);
      end if;

      if v_resto > 0 then
        v_parcela := round(v_resto / v_n, 2);
        for i in 1..v_n loop
          insert into public.lancamentos (cliente_id, orcamento_id, descricao, origem, divisao, valor, vencimento)
          values (
            new.cliente_id, new.id,
            case when v_n = 1 then 'Restante · ' else 'Parcela ' || i || '/' || v_n || ' · ' end || v_ref,
            'orcamento', new.divisao,
            -- a última parcela absorve o arredondamento
            case when i = v_n then v_resto - v_parcela * (v_n - 1) else v_parcela end,
            v_dia + 30 * i
          );
        end loop;
      end if;
    end if;
  end if;

  if v_mensal > 0 then
    insert into public.lancamentos (cliente_id, orcamento_id, descricao, origem, divisao, valor, vencimento)
    values (new.cliente_id, new.id, '1ª mensalidade · ' || v_ref, 'mensalidade', new.divisao, v_mensal, v_dia + 30);
  end if;

  return new;
end;
$$;

revoke execute on function public.gerar_lancamentos_orcamento() from public, anon, authenticated;

create trigger orcamentos_gera_lancamentos
  after update of status on public.orcamentos
  for each row execute function public.gerar_lancamentos_orcamento();
