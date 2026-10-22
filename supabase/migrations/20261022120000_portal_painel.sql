-- Portal do cliente no Design System: dados lidos direto das tabelas novas
-- (lancamentos, eventos_agenda, matriculas/pacotes, orçamentos).
-- O que cada aba mostra continua seguindo os interruptores da ficha no /painel;
-- o filtro acontece aqui, então o navegador do cliente só recebe o que pode ver.

create or replace function public.portal_painel(p_token uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with c as (
    select cl.*,
      (coalesce(cl.aba_sessoes, true) and coalesce(cl.sessoes_visiveis, false)) as ver_sessoes,
      (coalesce(cl.aba_servicos, true) and coalesce(cl.servicos_visivel, false)) as ver_servicos,
      (coalesce(cl.aba_conteudo, true) and coalesce(cl.conteudo_visivel, false)) as ver_conteudo,
      (coalesce(cl.aba_financeiro, true) and coalesce(cl.financeiro_visivel, false)) as ver_financeiro,
      ('aluno' = any(coalesce(cl.papeis, '{}'))) as aluno
    from public.portal_sessoes ps
    join public.clientes cl on cl.id = ps.cliente_id
    where ps.token = p_token and ps.expira_em > now()
  )
  select jsonb_build_object(
    'cliente', jsonb_build_object(
      'nome', c.nome, 'empresa', c.empresa, 'papeis', coalesce(to_jsonb(c.papeis), '[]'::jsonb),
      'ver_sessoes', c.ver_sessoes, 'ver_servicos', c.ver_servicos, 'ver_conteudo', c.ver_conteudo,
      'ver_financeiro', c.ver_financeiro, 'aluno', c.aluno
    ),
    'lancamentos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.id, 'descricao', l.descricao, 'origem', l.origem, 'divisao', l.divisao,
        'valor', l.valor, 'vencimento', l.vencimento, 'status', l.status, 'pago_em', l.pago_em, 'forma', l.forma
      ) order by l.vencimento desc)
      from public.lancamentos l
      where l.cliente_id = c.id
        and l.status <> 'cancelado'
        and (c.ver_financeiro or case when l.origem = 'sessao' then c.ver_sessoes else c.ver_servicos end)
    ), '[]'::jsonb),
    'agenda', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'tipo', e.tipo, 'titulo', e.titulo, 'inicio', e.inicio, 'fim', e.fim,
        'presenca', e.presenca, 'reposicao', e.reposicao_de is not null,
        'valor', l.valor, 'pago', l.status = 'pago'
      ) order by e.inicio desc)
      from public.eventos_agenda e
      left join public.lancamentos l on l.id = e.lancamento_id and l.status <> 'cancelado'
      where e.cliente_id = c.id
        and not e.cancelado
        and e.inicio < now() + interval '60 days'
        and ((e.tipo = 'sessao' and c.ver_sessoes) or (e.tipo = 'aula' and c.aluno))
    ), '[]'::jsonb),
    'matriculas', case when c.aluno then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'instrumento', m.instrumento, 'modalidade', m.modalidade, 'horarios', m.horarios,
        'duracao_min', m.duracao_min, 'aulas_por_pacote', m.aulas_por_pacote,
        'pacotes', coalesce((
          select jsonb_agg(jsonb_build_object(
            'numero', p.numero, 'total', p.total,
            'pago', coalesce((select l.status = 'pago' from public.lancamentos l where l.id = p.lancamento_id), false),
            'usos', coalesce((
              select jsonb_agg(jsonb_build_object('presenca', e.presenca, 'reposicao', e.reposicao_de is not null) order by e.inicio)
              from public.eventos_agenda e
              where e.pacote_id = p.id and not e.cancelado
            ), '[]'::jsonb)
          ) order by p.numero)
          from public.pacotes_aulas p
          where p.matricula_id = m.id
        ), '[]'::jsonb)
      ) order by m.created_at)
      from public.matriculas m
      where m.cliente_id = c.id and m.status = 'ativa'
    ), '[]'::jsonb) else '[]'::jsonb end,
    'modulos', case when c.ver_conteudo then coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.id, 'titulo', m.titulo, 'descricao', m.descricao,
        'conteudos', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', ac.id, 'tipo', ac.tipo, 'titulo', ac.titulo, 'descricao', ac.descricao, 'url', ac.url, 'conteudo', ac.conteudo
          ) order by ac.ordem)
          from public.aulas_conteudos ac
          where ac.modulo_id = m.id
        ), '[]'::jsonb)
      ) order by m.ordem)
      from public.aulas_modulos m
      where m.cliente_id = c.id
    ), '[]'::jsonb) else '[]'::jsonb end,
    'orcamentos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'numero', o.numero, 'slug', o.slug, 'titulo', o.projeto_titulo, 'divisao', o.divisao,
        'status', o.status, 'data', o.data_emissao, 'validade', o.validade,
        'total', greatest(0, coalesce((
          select sum(i.valor * i.quantidade) from public.orcamento_itens i where i.orcamento_id = o.id
        ), 0) - coalesce(o.desconto, 0))
      ) order by o.data_emissao desc)
      from public.orcamentos o
      where o.cliente_id = c.id and o.status in ('enviado', 'visualizado', 'aprovado')
    ), '[]'::jsonb)
  )
  from c;
$$;

revoke all on function public.portal_painel(uuid) from public;
grant execute on function public.portal_painel(uuid) to anon, authenticated;
