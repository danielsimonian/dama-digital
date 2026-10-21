-- /painel · etapa 4 — financeiro: migra o histórico antigo e o portal passa a ler as tabelas novas
-- · servicos (cobranças avulsas/parcelas)  → lancamentos (origem avulso)
-- · sessoes (estúdio por hora)              → eventos_agenda (sessão) + lancamentos (origem sessao)
-- · pagamentos está vazia
-- · orçamentos aprovados antes do /painel NÃO geram lançamentos: as cobranças deles já estão em servicos
-- As tabelas antigas ficam intactas (nada é apagado); `legado` evita duplicar se rodar de novo.

alter table public.lancamentos add column if not exists legado text unique;
alter table public.eventos_agenda add column if not exists legado text unique;

-- servicos → lançamentos
insert into public.lancamentos (cliente_id, descricao, origem, divisao, valor, vencimento, status, pago_em, observacoes, legado)
select
  s.cliente_id,
  s.nome || coalesce(' · ' || nullif(s.descricao, ''), ''),
  'avulso', 'studio', s.valor, s.data,
  case when s.pago then 'pago' else 'pendente' end,
  -- servicos.pago_em não tem fuso: a data já é a local
  case when s.pago then coalesce(s.pago_em::date, s.data) end,
  s.observacoes,
  'servicos:' || s.id
from public.servicos s
on conflict (legado) do nothing;

-- sessoes → lançamentos (valor/hora × duração)
insert into public.lancamentos (cliente_id, descricao, origem, divisao, valor, vencimento, status, pago_em, observacoes, legado)
select
  s.cliente_id,
  'Sessão de estúdio · ' || to_char(s.data, 'DD/MM') || ' · ' || to_char(s.hora_inicio, 'HH24:MI') || '–' || to_char(s.hora_fim, 'HH24:MI'),
  'sessao', 'studio',
  round(s.valor_hora * extract(epoch from (s.hora_fim - s.hora_inicio)) / 3600, 2),
  s.data,
  case when s.pago then 'pago' else 'pendente' end,
  case when s.pago then coalesce((s.pago_em at time zone 'America/Sao_Paulo')::date, s.data) end,
  s.observacoes,
  'sessoes:' || s.id
from public.sessoes s
where s.hora_fim > s.hora_inicio
on conflict (legado) do nothing;

-- sessoes → agenda (realizadas; o lançamento já existe, então o gatilho de presença não cobra de novo)
insert into public.eventos_agenda (tipo, cliente_id, titulo, inicio, fim, presenca, observacoes, lancamento_id, legado)
select
  'sessao', s.cliente_id, 'Sessão de estúdio',
  (s.data + s.hora_inicio) at time zone 'America/Sao_Paulo',
  (s.data + s.hora_fim) at time zone 'America/Sao_Paulo',
  case when s.data <= current_date then 'realizada' else 'agendada' end,
  s.observacoes,
  (select l.id from public.lancamentos l where l.legado = 'sessoes:' || s.id),
  'sessoes:' || s.id
from public.sessoes s
where s.hora_fim > s.hora_inicio
on conflict (legado) do nothing;

-- ------------------------------------------------------------------
-- Portal do cliente: mesmos campos de antes, vindos das tabelas novas
-- ------------------------------------------------------------------
-- sessões = sessões de estúdio da agenda (valor_hora derivado do lançamento;
--           sessão sem cobrança própria, ex. coberta por orçamento, aparece quitada)
-- serviços = demais lançamentos (avulsos, parcelas de orçamento, pacotes de aulas)

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
      select jsonb_agg(jsonb_build_object(
        'id', e.id,
        'data', (e.inicio at time zone 'America/Sao_Paulo')::date,
        'hora_inicio', to_char(e.inicio at time zone 'America/Sao_Paulo', 'HH24:MI'),
        'hora_fim', to_char(e.fim at time zone 'America/Sao_Paulo', 'HH24:MI'),
        'valor_hora', case when l.id is null then 0
                      else round(l.valor / greatest(extract(epoch from (e.fim - e.inicio)) / 3600, 0.01), 2) end,
        'observacoes', e.observacoes,
        'pago', coalesce(l.status = 'pago', true),
        'pago_em', l.pago_em
      ) order by e.inicio desc)
      from public.eventos_agenda e
      left join public.lancamentos l on l.id = e.lancamento_id and l.status <> 'cancelado'
      where e.cliente_id = c.id and e.tipo = 'sessao' and not e.cancelado
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
      select jsonb_agg(jsonb_build_object(
        'id', l.id,
        'nome', l.descricao,
        'descricao', null,
        'valor', l.valor,
        'data', l.vencimento,
        'pago', l.status = 'pago',
        'pago_em', l.pago_em,
        'observacoes', l.observacoes
      ) order by l.vencimento desc)
      from public.lancamentos l
      where l.cliente_id = c.id
        and l.status <> 'cancelado'
        and l.origem <> 'sessao'
    ), '[]'::jsonb)
  )
  from public.portal_sessoes ps
  join public.clientes c on c.id = ps.cliente_id
  where ps.token = p_token and ps.expira_em > now();
$$;
