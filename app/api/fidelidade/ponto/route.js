import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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

    // Verifica se o código existe e ainda não foi usado
    const codigoData = await redis.get(`codigo:${slug}:${codigo}`);
    
    if (!codigoData) {
      return NextResponse.json({ erro: 'Código inválido ou expirado' }, { status: 400 });
    }

    if (codigoData.usado) {
      return NextResponse.json({ erro: 'Código já foi utilizado' }, { status: 400 });
    }

    // Marca o código como usado (globalmente)
    await redis.del(`codigo:${slug}:${codigo}`);

    // Busca ou cria cliente
    let cliente = await redis.get(`cliente:${slug}:${telefone}`);
    if (!cliente) {
      cliente = { pontos: 0, resgates: 0 };
    }

    // Adiciona ponto
    cliente.pontos += 1;
    
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