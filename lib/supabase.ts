// ============================================
// ARQUIVO: lib/supabase.ts
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TIPOS
// ============================================

export type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

export type Cliente = {
  id: string;
  nome: string;
  empresa: string | null;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  endereco: string | null;
  notas: string | null;
  created_at: string;
  servicos_visivel?: boolean;
  areas?: Divisao[];
  // campos do /painel (cadastro único de pessoas)
  papeis?: Papel[];
  status?: PessoaStatus;
  instrumento?: string | null;
  responsavel?: Responsavel | null;
  // portal do cliente: a senha é guardada só como hash; `senha_acesso` serve só para gravar uma nova
  slug?: string | null;
  senha_hash?: string | null;
  senha_acesso?: string | null;
  // o portal mostra a aba quando `aba_*` (padrão true) e `*_visivel` estão ligados
  sessoes_visiveis?: boolean;
  conteudo_visivel?: boolean;
  financeiro_visivel?: boolean;
  aba_sessoes?: boolean;
  aba_servicos?: boolean;
  aba_conteudo?: boolean;
  aba_financeiro?: boolean;
};

export type TipoConteudo = 'video' | 'pdf' | 'exercicio' | 'link' | 'texto';

export type AulaConteudo = {
  id: string;
  modulo_id: string;
  tipo: TipoConteudo;
  titulo: string;
  descricao: string | null;
  url: string | null;
  conteudo: string | null;
  ordem: number;
};

export type AulaModulo = {
  id: string;
  cliente_id: string;
  titulo: string;
  descricao: string | null;
  ordem: number;
  conteudos?: AulaConteudo[];
};

export type Papel = 'aluno' | 'estudio' | 'tech' | 'sports';
export type PessoaStatus = 'ativo' | 'pausado' | 'lead';
export type Responsavel = 'daniel' | 'marcella';

export type CatalogoUnidade = 'aula' | 'mês' | 'hora' | 'pacote' | 'faixa' | 'projeto' | 'evento' | 'dia' | 'atleta';

export type CatalogoServico = {
  id: string;
  nome: string;
  divisao: Divisao;
  valor: number;
  unidade: CatalogoUnidade;
  descricao: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type Orcamento = {
  id: string;
  numero: string;
  slug: string;
  cliente_id: string | null;
  criado_por: string | null;
  projeto_titulo: string;
  projeto_descricao: string | null;
  divisao: 'tech' | 'sports' | 'studio';
  data_emissao: string;
  validade: string | null;
  desconto: number;
  observacoes: string | null;
  condicoes_pagamento: string | null;
  prazo_entrega: string | null;
  status: 'rascunho' | 'enviado' | 'visualizado' | 'aprovado' | 'recusado' | 'expirado';
  tipo: 'simples' | 'pacotes';
  pacote_escolhido: string | null;
  visualizado_em: string | null;
  aprovado_em: string | null;
  created_at: string;
  updated_at: string;
  // plano de pagamento do /painel (null em orçamentos antigos)
  entrada_pct?: number | null;
  parcelas?: number | null;
  versao?: number;
  cliente?: Cliente;
  itens?: OrcamentoItem[];
};

export type OrcamentoItem = {
  id: string;
  orcamento_id: string;
  categoria: string;
  nome: string;
  descricao: string | null;
  valor: number;
  quantidade: number;
  detalhes: { texto: string; valor: number | null }[] | null;
  ordem: number;
  pacote: string | null;
  pacote_destaque: boolean;
  valor_mensal: number | null;
  descricao_mensal: string | null;
  catalogo_id?: string | null;
  unidade?: CatalogoUnidade | null;
};

/** Retorno de `orcamento_publico(slug)`; rascunho volta só com o status. */
export type OrcamentoPublico = Omit<Orcamento, 'cliente' | 'itens'> & { cliente: { nome: string } | null; itens: OrcamentoItem[] };

export type OrcamentoVersao = {
  id: string;
  orcamento_id: string;
  versao: number;
  snapshot: { orcamento: Partial<Orcamento>; itens: Partial<OrcamentoItem>[] };
  criado_por: string | null;
  created_at: string;
};

export type LancamentoOrigem = 'orcamento' | 'mensalidade' | 'sessao' | 'pacote' | 'avulso';
export type LancamentoForma = 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto' | 'Transferência';

export type Lancamento = {
  id: string;
  cliente_id: string | null;
  orcamento_id: string | null;
  descricao: string;
  origem: LancamentoOrigem;
  divisao: Divisao;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'cancelado';
  pago_em: string | null;
  forma: LancamentoForma | null;
  observacoes: string | null;
  /** origem no admin antigo (ex.: "sessoes:<id>"), quando migrado */
  legado?: string | null;
  created_at: string;
  updated_at: string;
};

export type Servico = {
  id: string;
  cliente_id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  data: string;
  pago: boolean;
  pago_em: string | null;
  observacoes: string | null;
  created_at: string;
};

/** dia 0 = segunda … 6 = domingo; hora "HH:MM" (horário de Brasília) */
export type HorarioAula = { dia: number; hora: string };

export type Matricula = {
  id: string;
  cliente_id: string;
  instrumento: string | null;
  responsavel: Responsavel | null;
  modalidade: 'pacote' | 'avulsa';
  aulas_por_pacote: number;
  valor_pacote: number;
  valor_aula: number;
  duracao_min: number;
  horarios: HorarioAula[];
  inicio: string;
  fim: string | null;
  status: 'ativa' | 'pausada' | 'encerrada';
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

export type PacoteAulas = {
  id: string;
  matricula_id: string;
  numero: number;
  total: number;
  valor: number;
  lancamento_id: string | null;
  created_at: string;
};

export type PresencaAgenda = 'agendada' | 'realizada' | 'falta' | 'justificada';

export type EventoAgenda = {
  id: string;
  tipo: 'aula' | 'sessao' | 'outro';
  cliente_id: string | null;
  matricula_id: string | null;
  pacote_id: string | null;
  orcamento_id: string | null;
  lancamento_id: string | null;
  titulo: string;
  inicio: string;
  fim: string;
  responsavel: Responsavel | null;
  presenca: PresencaAgenda;
  cancelado: boolean;
  reposicao_de: string | null;
  slot_original: string | null;
  valor_aula: number | null;
  observacoes: string | null;
  legado?: string | null;
  created_at: string;
  updated_at: string;
};

/** Retorno de `portal_painel(token)`: só o que os interruptores da ficha deixam o cliente ver. */
export type PortalPainel = {
  cliente: {
    nome: string;
    empresa: string | null;
    papeis: Papel[];
    ver_sessoes: boolean;
    ver_servicos: boolean;
    ver_conteudo: boolean;
    ver_financeiro: boolean;
    aluno: boolean;
  };
  lancamentos: Pick<Lancamento, 'id' | 'descricao' | 'origem' | 'divisao' | 'valor' | 'vencimento' | 'status' | 'pago_em' | 'forma'>[];
  agenda: (Pick<EventoAgenda, 'id' | 'tipo' | 'titulo' | 'inicio' | 'fim' | 'presenca'> & { reposicao: boolean; valor: number | null; pago: boolean | null })[];
  matriculas: {
    id: string;
    instrumento: string | null;
    modalidade: Matricula['modalidade'];
    horarios: HorarioAula[];
    duracao_min: number;
    aulas_por_pacote: number;
    pacotes: { numero: number; total: number; pago: boolean; usos: { presenca: PresencaAgenda; reposicao: boolean }[] }[];
  }[];
  modulos: (Pick<AulaModulo, 'id' | 'titulo' | 'descricao'> & { conteudos: Pick<AulaConteudo, 'id' | 'tipo' | 'titulo' | 'descricao' | 'url' | 'conteudo'>[] })[];
  orcamentos: (Pick<Orcamento, 'numero' | 'slug' | 'divisao' | 'status' | 'validade'> & { titulo: string; data: string; total: number })[];
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

export function gerarSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatarDataCurta(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

// ============================================
// CONFIGURAÇÃO DAS DIVISÕES
// ============================================

export const DIVISAO_CONFIG = {
  tech: {
    nome: 'DAMA Tech',
    gradiente: 'from-purple-500 to-pink-500',
    hexInicio: '#A855F7',
    hexFim: '#EC4899',
    hexAcento: '#7E22CE',
    bgLight: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
  },
  sports: {
    nome: 'DAMA Sports',
    gradiente: 'from-orange-500 to-red-500',
    hexInicio: '#F97316',
    hexFim: '#EF4444',
    hexAcento: '#C2410C',
    bgLight: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/50',
  },
  studio: {
    nome: 'DAMA Studio',
    gradiente: 'from-blue-500 to-cyan-400',
    hexInicio: '#3B82F6',
    hexFim: '#22D3EE',
    hexAcento: '#1D4ED8',
    bgLight: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
  },
} as const;

// Tipo para usar em TypeScript
export type Divisao = keyof typeof DIVISAO_CONFIG;