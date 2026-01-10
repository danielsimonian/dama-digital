import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// GET - Buscar pontos do cliente
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const telefone = searchParams.get('telefone');

  if (!slug || !telefone) {
    return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
  }

  try {
    // Verifica se a loja existe
    const loja = await redis.get(`loja:${slug}`);
    if (!loja) {
      return NextResponse.json({ erro: 'Loja não encontrada' }, { status: 404 });
    }

    // Busca dados do cliente
    const cliente = await redis.get(`cliente:${slug}:${telefone}`);

    if (!cliente) {
      // Cliente novo - retorna zerado
      return NextResponse.json({ pontos: 0, resgates: 0 });
    }

    return NextResponse.json({
      pontos: cliente.pontos || 0,
      resgates: cliente.resgates || 0,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}