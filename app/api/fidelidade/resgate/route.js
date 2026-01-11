import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// POST - Resgatar prêmio (requer senha do vendedor)
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, telefone, senha } = body;

    if (!slug || !telefone || !senha) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    // Busca a loja
    const loja = await redis.get(`loja:${slug}`);
    if (!loja) {
      return NextResponse.json({ erro: 'Loja não encontrada' }, { status: 404 });
    }

    // Verifica senha do vendedor
    if (loja.senha !== senha) {
      return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 });
    }

    // Busca cliente
    const cliente = await redis.get(`cliente:${slug}:${telefone}`);
    if (!cliente) {
      return NextResponse.json({ erro: 'Cliente não encontrado' }, { status: 404 });
    }

    // Verifica se tem resgates disponíveis
    if (cliente.resgates <= 0) {
      return NextResponse.json({ erro: 'Nenhum resgate disponível' }, { status: 400 });
    }

    // Realiza o resgate
    cliente.resgates -= 1;
    cliente.ultimoResgate = new Date().toISOString();

    // Salva
    await redis.set(`cliente:${slug}:${telefone}`, cliente);

    return NextResponse.json({
      pontos: cliente.pontos,
      resgates: cliente.resgates,
      resgatadoEm: cliente.ultimoResgate,
    });
  } catch (error) {
    console.error('Erro ao resgatar:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}