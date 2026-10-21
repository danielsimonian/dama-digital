import type { Divisao } from '@/lib/supabase';

export type Papel = 'aluno' | 'estudio' | 'tech' | 'sports';
export type Responsavel = 'daniel' | 'marcella';

export type Presenca = 'agendada' | 'realizada' | 'falta' | 'justificada' | 'reposicao';

export type Plano = { nome: string; aulasMes: number; valor: number; vencimento: number; horario: string };
export type PacoteHoras = { total: number; usadas: number; valor: number; validade: string };

export type Pessoa = {
  id: string;
  nome: string;
  papeis: Papel[];
  status: 'ativo' | 'pausado' | 'lead';
  email: string;
  whatsapp: string;
  desde: string;
  instrumento?: string;
  responsavel: Responsavel;
  plano?: Plano;
  pacote?: PacoteHoras;
  frequencia?: Presenca[];
  aReceber: number;
  atrasado: boolean;
  proximo?: string;
};

export type EventoTipo = 'aula' | 'sessao';

export type Evento = {
  id: string;
  tipo: EventoTipo;
  pessoaId: string;
  titulo: string;
  dia: number; // 0 = segunda
  inicio: number; // horas decimais, ex.: 19.5
  fim: number;
  responsavel: Responsavel;
  presenca: Presenca;
  sala: string;
};

export type LancamentoStatus = 'pago' | 'pendente' | 'atrasado' | 'previsto';
export type Origem = 'mensalidade' | 'sessao' | 'pacote' | 'orcamento' | 'avulso';

export type Lancamento = {
  id: string;
  vencimento: string;
  pessoaId: string;
  descricao: string;
  origem: Origem;
  divisao: Divisao;
  valor: number;
  status: LancamentoStatus;
  forma?: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto';
  pagoEm?: string;
};

export type OrcamentoStatus = 'rascunho' | 'enviado' | 'visualizado' | 'aprovado' | 'recusado' | 'expirado';

export type OrcamentoResumo = {
  numero: string;
  titulo: string;
  pessoaId: string;
  divisao: Divisao;
  valor: number;
  status: OrcamentoStatus;
  versao: number;
  atualizado: string;
};

export type CatalogoItem = {
  id: string;
  nome: string;
  divisao: Divisao;
  valor: number;
  unidade: 'aula' | 'mês' | 'hora' | 'pacote' | 'faixa' | 'projeto' | 'evento' | 'dia' | 'atleta';
  descricao: string;
};

export type MesFinanceiro = { mes: string; ano?: number; recebido: number; aReceber: number };
