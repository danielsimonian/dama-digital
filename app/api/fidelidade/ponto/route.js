import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Valida código (verifica bloco atual e anterior)
function validarCodigo(codigo, slug, senha) {
  const agora = Date.now();
  
  // Verifica bloco atual
  const blocoAtual = Math.floor(agora / (5 * 60 * 1000));
  let hash = 0;
  let str = `${slug}-${senha}-${blocoAtual}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const codigoAtual = Math.abs(hash % 900000 + 100000).toString();
  
  if (codigo === codigoAtual) return true;
  
  // Verifica bloco anterior (para códigos gerados no fim do bloco)
  const blocoAnterior = blocoAtual - 1;
  hash = 0;
  str = `${slug}-${senha}-${blocoAnterior}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  const codigoAnterior = Math.abs(hash % 900000 + 100000).toString();
  
  return codigo === codigoAnterior;
}

// POST - Adicionar ponto
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, telefone, codigo } = body;

    if (!slug || !telefone || !codigo) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    // Busca a loja
    const loja = await redis.get(`loja:${slug}`);
    if (!loja) {
      return NextResponse.json({ erro: 'Loja não encontrada' }, { status: 404 });
    }

    // Valida o código
    if (!validarCodigo(codigo, slug, loja.senha)) {
      return NextResponse.json({ erro: 'Código inválido ou expirado' }, { status: 400 });
    }

    // Busca ou cria cliente
    let cliente = await redis.get(`cliente:${slug}:${telefone}`);
    if (!cliente) {
      cliente = { pontos: 0, resgates: 0, ultimoCodigo: '' };
    }

    // Verifica se código já foi usado por este cliente
    if (cliente.ultimoCodigo === codigo) {
      return NextResponse.json({ erro: 'Código já utilizado' }, { status: 400 });
    }

    // Adiciona ponto
    cliente.pontos += 1;
    cliente.ultimoCodigo = codigo;
    
    let ganhouResgate = false;

    // Verifica se completou a meta
    if (cliente.pontos >= loja.meta) {
      cliente.pontos = 0;
      cliente.resgates += 1;
      ganhouResgate = true;
    }

    // Salva
    await redis.set(`cliente:${slug}:${telefone}`, cliente);

    return NextResponse.json({
      pontos: cliente.pontos,
      resgates: cliente.resgates,
      ganhouResgate,
    });
  } catch (error) {
    console.error('Erro ao adicionar ponto:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}