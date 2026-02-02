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
  visualizado_em: string | null;
  aprovado_em: string | null;
  created_at: string;
  updated_at: string;
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
  detalhes: string[] | null;
  ordem: number;
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
    bgLight: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/50',
  },
  sports: {
    nome: 'DAMA Sports',
    gradiente: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    hoverBorder: 'hover:border-orange-500/50',
  },
  studio: {
    nome: 'DAMA Studio',
    gradiente: 'from-blue-500 to-cyan-400',
    bgLight: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/50',
  },
} as const;

// Tipo para usar em TypeScript
export type Divisao = keyof typeof DIVISAO_CONFIG;