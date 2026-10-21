import type { CatalogoUnidade, OrcamentoItem } from '@/lib/supabase';
import { DIVISAO_LABEL } from '@/components/ds/primitives';
import type { QuoteLine } from '@/components/ds/admin/quote-builder';

type ItemValores = Pick<OrcamentoItem, 'valor' | 'quantidade' | 'valor_mensal'>;

/** Mesmo cálculo da página pública: valor × quantidade − desconto; mensal somado à parte. */
export function totaisOrcamento(itens: ItemValores[], desconto: number) {
  const subtotal = itens.reduce((s, i) => s + Number(i.valor) * Number(i.quantidade), 0);
  const mensal = itens.reduce((s, i) => s + (Number(i.valor_mensal) || 0), 0);
  return { subtotal, mensal, total: Math.max(0, subtotal - (Number(desconto) || 0)) };
}

/** Texto de condições que aparece para o cliente; os lançamentos seguem a mesma regra. */
export function condicoesTexto(entrada: number, parcelas: number) {
  if (entrada >= 100) return '100% na aprovação';
  const dias = Array.from({ length: parcelas }, (_, i) => (i + 1) * 30).join('/');
  const resto = parcelas === 1 ? `restante em ${dias} dias` : `restante em ${parcelas}× (${dias} dias)`;
  if (entrada <= 0) return parcelas === 1 ? `Pagamento em ${dias} dias após a aprovação` : `Em ${parcelas}× (${dias} dias após a aprovação)`;
  return `${entrada}% na aprovação + ${resto}`;
}

const UNIDADES: CatalogoUnidade[] = ['aula', 'mês', 'hora', 'pacote', 'faixa', 'projeto', 'evento', 'dia', 'atleta'];

/**
 * Item salvo → linha do editor. Itens mensais são gravados com valor 0 e valor_mensal;
 * itens antigos com valor único e mensal viram duas linhas (o total não muda).
 */
export function itensParaLinhas(itens: OrcamentoItem[], divisaoPadrao: QuoteLine['divisao']): QuoteLine[] {
  const linhas: QuoteLine[] = [];
  for (const it of itens) {
    const qtd = Number(it.quantidade) || 1;
    const valor = Number(it.valor) || 0;
    const mensal = Number(it.valor_mensal) || 0;
    const unidade = it.unidade && UNIDADES.includes(it.unidade) ? it.unidade : 'projeto';
    const cat = it.categoria?.toLowerCase() ?? '';
    const divisao = cat.includes('tech') ? 'tech' : cat.includes('sports') ? 'sports' : cat.includes('studio') ? 'studio' : divisaoPadrao;
    const base = { catalogoId: it.catalogo_id ?? null, descricao: it.descricao, detalhes: it.detalhes, divisao };
    if (mensal > 0 && valor === 0) {
      linhas.push({ ...base, id: it.id, nome: it.nome, valor: mensal / qtd, qtd, unidade: 'mês' });
      continue;
    }
    linhas.push({ ...base, id: it.id, nome: it.nome, valor, qtd, unidade: unidade === 'mês' ? 'projeto' : unidade });
    if (mensal > 0) {
      linhas.push({ ...base, id: `${it.id}-mensal`, nome: it.descricao_mensal || `${it.nome} · mensal`, valor: mensal, qtd: 1, unidade: 'mês', detalhes: null });
    }
  }
  return linhas;
}

export function linhasParaItens(linhas: QuoteLine[], orcamentoId: string) {
  return linhas.map((l, ordem) => {
    const mensal = l.unidade === 'mês';
    return {
      orcamento_id: orcamentoId,
      categoria: DIVISAO_LABEL[l.divisao],
      nome: l.nome,
      descricao: l.descricao ?? null,
      detalhes: l.detalhes ?? null,
      valor: mensal ? 0 : l.valor,
      quantidade: l.qtd,
      valor_mensal: mensal ? l.valor * l.qtd : null,
      descricao_mensal: null,
      ordem,
      pacote: null,
      pacote_destaque: false,
      catalogo_id: l.catalogoId ?? null,
      unidade: l.unidade,
    };
  });
}
