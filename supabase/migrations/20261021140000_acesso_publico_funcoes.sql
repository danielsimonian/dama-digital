-- Segurança, parte 1 de 2 — só acrescenta (nada deixa de funcionar).
-- Cria a lista da equipe e as funções que o portal do cliente e a página pública
-- de orçamento passam a usar no lugar de ler as tabelas direto.
-- A parte 2 (20261021150000_acesso_publico_fecha.sql) remove o acesso anon às tabelas.

-- ------------------------------------------------------------------
-- Equipe
-- ------------------------------------------------------------------

create table if not exists public.equipe (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.equipe enable row level security;

insert into public.equipe (user_id)
select id from auth.users
where email in ('danielsimonian@gmail.com', 'danielsimonianti@gmail.com', 'marcellalimafotografia@gmail.com')
on conflict do nothing;

create or replace function public.is_equipe()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.equipe where user_id = auth.uid());
$$;

revoke all on function public.is_equipe() from public;
grant execute on function public.is_equipe() to authenticated;

create policy "equipe_le_equipe" on public.equipe for select to authenticated using (public.is_equipe());

-- ------------------------------------------------------------------
-- Portal do cliente
-- ------------------------------------------------------------------

create table if not exists public.portal_sessoes (
  token uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  expira_em timestamptz not null default now() + interval '12 hours'
);
alter table public.portal_sessoes enable row level security;
-- sem políticas: só as funções abaixo acessam

-- dados mínimos para a tela de senha
create or replace function public.portal_cliente(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', c.id, 'nome', c.nome)
  from public.clientes c
  where c.slug = p_slug and c.senha_acesso is not null;
$$;

-- confere a senha e devolve um token de sessão (ou null)
create or replace function public.portal_entrar(p_slug text, p_senha text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_cliente uuid;
  v_token uuid;
begin
  delete from public.portal_sessoes where expira_em < now();

  select c.id into v_cliente
  from public.clientes c
  where c.slug = p_slug and c.senha_acesso is not null and c.senha_acesso = p_senha;

  if v_cliente is null then
    perform pg_sleep(0.5); -- freia tentativas em sequência
    return null;
  end if;

  insert into public.portal_sessoes (cliente_id) values (v_cliente) returning token into v_token;
  return v_token;
end;
$$;

-- tudo que o portal mostra, para um token válido
create or replace function public.portal_dados(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'cliente', jsonb_build_object(
      'id', c.id, 'nome', c.nome, 'areas', c.areas, 'slug', c.slug,
      'sessoes_visiveis', c.sessoes_visiveis, 'conteudo_visivel', c.conteudo_visivel,
      'financeiro_visivel', c.financeiro_visivel, 'servicos_visivel', c.servicos_visivel,
      'aba_sessoes', c.aba_sessoes, 'aba_servicos', c.aba_servicos,
      'aba_conteudo', c.aba_conteudo, 'aba_financeiro', c.aba_financeiro
    ),
    'sessoes', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.data desc) from public.sessoes s where s.cliente_id = c.id
    ), '[]'::jsonb),
    'modulos', coalesce((
      select jsonb_agg(
        to_jsonb(m) || jsonb_build_object('conteudos', coalesce((
          select jsonb_agg(to_jsonb(ac) order by ac.ordem) from public.aulas_conteudos ac where ac.modulo_id = m.id
        ), '[]'::jsonb))
        order by m.ordem
      ) from public.aulas_modulos m where m.cliente_id = c.id
    ), '[]'::jsonb),
    'pagamentos', coalesce((
      select jsonb_agg(to_jsonb(pg) order by pg.data desc) from public.pagamentos pg where pg.cliente_id = c.id
    ), '[]'::jsonb),
    'servicos', coalesce((
      select jsonb_agg(to_jsonb(sv) order by sv.data desc) from public.servicos sv where sv.cliente_id = c.id
    ), '[]'::jsonb)
  )
  from public.portal_sessoes ps
  join public.clientes c on c.id = ps.cliente_id
  where ps.token = p_token and ps.expira_em > now();
$$;

create or replace function public.portal_sair(p_token uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from public.portal_sessoes where token = p_token;
$$;

-- ------------------------------------------------------------------
-- Página pública do orçamento
-- ------------------------------------------------------------------

create or replace function public.orcamento_publico(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when o.status = 'rascunho' then jsonb_build_object('status', 'rascunho')
    else to_jsonb(o)
      || jsonb_build_object('cliente', (select jsonb_build_object('nome', c.nome) from public.clientes c where c.id = o.cliente_id))
      || jsonb_build_object('itens', coalesce((
        select jsonb_agg(to_jsonb(i) order by i.ordem) from public.orcamento_itens i where i.orcamento_id = o.id
      ), '[]'::jsonb))
  end
  from public.orcamentos o
  where o.slug = p_slug;
$$;

create or replace function public.orcamento_registrar_visualizacao(p_slug text)
returns boolean
language sql
volatile
security definer
set search_path = ''
as $$
  with u as (
    update public.orcamentos
    set status = 'visualizado', visualizado_em = now()
    where slug = p_slug and status = 'enviado'
    returning 1
  )
  select exists (select 1 from u);
$$;

create or replace function public.orcamento_aprovar(p_slug text, p_pacote text default null)
returns boolean
language sql
volatile
security definer
set search_path = ''
as $$
  with u as (
    update public.orcamentos
    set status = 'aprovado', aprovado_em = now(), pacote_escolhido = coalesce(p_pacote, pacote_escolhido)
    where slug = p_slug and status in ('enviado', 'visualizado')
    returning 1
  )
  select exists (select 1 from u);
$$;

-- ------------------------------------------------------------------
-- Permissões das funções
-- ------------------------------------------------------------------

revoke all on function public.portal_cliente(text) from public;
revoke all on function public.portal_entrar(text, text) from public;
revoke all on function public.portal_dados(uuid) from public;
revoke all on function public.portal_sair(uuid) from public;
revoke all on function public.orcamento_publico(text) from public;
revoke all on function public.orcamento_registrar_visualizacao(text) from public;
revoke all on function public.orcamento_aprovar(text, text) from public;

grant execute on function public.portal_cliente(text) to anon, authenticated;
grant execute on function public.portal_entrar(text, text) to anon, authenticated;
grant execute on function public.portal_dados(uuid) to anon, authenticated;
grant execute on function public.portal_sair(uuid) to anon, authenticated;
grant execute on function public.orcamento_publico(text) to anon, authenticated;
grant execute on function public.orcamento_registrar_visualizacao(text) to anon, authenticated;
grant execute on function public.orcamento_aprovar(text, text) to anon, authenticated;

-- avisos do advisor: trigger de cadastro não deve ser chamável pela API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
alter function public.handle_new_user() set search_path = '';
alter function public.update_updated_at() set search_path = '';
