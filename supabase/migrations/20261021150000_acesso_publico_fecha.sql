-- Segurança, parte 2 de 2 — fecha o acesso direto às tabelas.
-- Aplicar só depois que o portal e a página de orçamento estiverem usando as funções
-- da parte 1 em produção.
-- Remove todas as políticas antigas (várias liberavam anon/public) e recria uma única
-- política por tabela, só para a equipe (public.equipe).

do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'clientes', 'orcamentos', 'orcamento_itens', 'orcamento_historico',
    'sessoes', 'pagamentos', 'servicos', 'aulas_modulos', 'aulas_conteudos',
    'profiles', 'catalogo_servicos'
  ] loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    if t <> 'profiles' then
      execute format(
        'create policy "equipe_tudo" on public.%I for all to authenticated using (public.is_equipe()) with check (public.is_equipe())',
        t
      );
    end if;
  end loop;
end $$;

create policy "equipe_le_perfis" on public.profiles for select to authenticated using (public.is_equipe());
create policy "edita_proprio_perfil" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
