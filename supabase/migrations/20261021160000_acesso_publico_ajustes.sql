-- Segurança, ajustes finais apontados pelo advisor.
-- is_equipe() é só para as políticas: o Supabase concede EXECUTE a anon por padrão.
revoke execute on function public.is_equipe() from anon;
-- search_path fixo (corpo usa tabelas sem schema, por isso 'public')
alter function public.gerar_numero_orcamento() set search_path = public;
