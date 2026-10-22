import type { Orcamento, PessoaStatus, Responsavel } from '@/lib/supabase';

export const STATUS_LABEL: Record<PessoaStatus, string> = { ativo: 'Ativo', pausado: 'Pausado', lead: 'Lead' };
export const RESP_LABEL: Record<Responsavel, string> = { daniel: 'Daniel Simonian', marcella: 'Marcella Lima' };
export const RESP_FOTO: Record<Responsavel, string> = { daniel: '/images/daniel.png', marcella: '/images/marcella.png' };

export const ORC_STATUS: Record<Orcamento['status'], string> = {
  rascunho: 'rascunho',
  enviado: 'enviado',
  visualizado: 'visualizado',
  aprovado: 'aprovado',
  recusado: 'recusado',
  expirado: 'expirado',
};

export function formatarDesde(data: string) {
  return new Date(data).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
}
