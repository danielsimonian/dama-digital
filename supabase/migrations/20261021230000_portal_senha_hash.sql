-- /painel · etapa 5 — senha do portal do cliente guardada com hash (bcrypt), nunca em texto
-- · `senha_hash` guarda o hash; `senha_acesso` vira só campo de entrada: o gatilho transforma em hash e apaga
-- · ninguém consegue ver a senha depois de salva — a equipe define uma nova quando precisar
-- · trocar ou remover a senha encerra as sessões abertas do portal
-- · portal_entrar: no máximo 10 tentativas erradas por portal a cada 15 minutos

alter table public.clientes add column if not exists senha_hash text;

create or replace function public.clientes_protege_senha()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.senha_acesso, '') <> '' then
    new.senha_hash := extensions.crypt(new.senha_acesso, extensions.gen_salt('bf', 10));
  end if;
  new.senha_acesso := null;
  if tg_op = 'UPDATE' and new.senha_hash is distinct from old.senha_hash then
    delete from public.portal_sessoes where cliente_id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function public.clientes_protege_senha() from public, anon, authenticated;

drop trigger if exists clientes_protege_senha on public.clientes;
create trigger clientes_protege_senha
  before insert or update on public.clientes
  for each row execute function public.clientes_protege_senha();

-- senhas atuais → hash (o gatilho faz o trabalho e apaga o texto)
update public.clientes set senha_acesso = senha_acesso where coalesce(senha_acesso, '') <> '';

-- tentativas erradas de entrar no portal (só as funções acessam)
create table if not exists public.portal_tentativas (
  id bigint generated always as identity primary key,
  slug text not null,
  em timestamptz not null default now()
);
create index if not exists portal_tentativas_slug_em on public.portal_tentativas (slug, em);
alter table public.portal_tentativas enable row level security;
revoke all on public.portal_tentativas from anon, authenticated;

create or replace function public.portal_cliente(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('id', c.id, 'nome', c.nome)
  from public.clientes c
  where c.slug = p_slug and c.senha_hash is not null;
$$;

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
  delete from public.portal_tentativas where em < now() - interval '1 day';

  if (select count(*) from public.portal_tentativas t
      where t.slug = p_slug and t.em > now() - interval '15 minutes') >= 10 then
    perform pg_sleep(0.5);
    return null;
  end if;

  select c.id into v_cliente
  from public.clientes c
  where c.slug = p_slug and c.senha_hash is not null
    and c.senha_hash = extensions.crypt(coalesce(p_senha, ''), c.senha_hash);

  if v_cliente is null then
    insert into public.portal_tentativas (slug) values (left(coalesce(p_slug, ''), 200));
    perform pg_sleep(0.5); -- freia tentativas em sequência
    return null;
  end if;

  delete from public.portal_tentativas where slug = p_slug;
  insert into public.portal_sessoes (cliente_id) values (v_cliente) returning token into v_token;
  return v_token;
end;
$$;
